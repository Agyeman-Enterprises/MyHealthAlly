import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { VisitRequestsService } from '../visit-requests/visit-requests.service';
import { CarePlansService } from '../care-plans/care-plans.service';
import {
  ClinicalRule,
  ClinicalRuleCondition,
  MetricType,
  ConditionOp,
  Severity,
  ActionType,
  RuleExecutionResult,
} from '@myhealthally/shared';
import { AlertSeverity, AlertType } from '@myhealthally/shared';

@Injectable()
export class RulesEngineService {
  private readonly logger = new Logger(RulesEngineService.name);

  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService,
    private visitRequestsService: VisitRequestsService,
    private carePlansService: CarePlansService,
  ) {}

  async evaluateRulesForPatient(patientId: string): Promise<void> {
    const rules = await this.prisma.clinicalRule.findMany({
      where: { enabled: true },
      orderBy: { priority: 'desc' },
    });

    for (const rule of rules) {
      try {
        const result = await this.evaluateRule(patientId, rule as any);
        
        // Log execution
        await this.prisma.ruleExecution.create({
          data: {
            ruleId: rule.id,
            patientId,
            triggered: result.triggered,
            result: result as any,
          },
        });

        if (result.triggered) {
          await this.executeAction(patientId, rule as any, result);
        }
      } catch (error) {
        this.logger.error(`Error evaluating rule ${rule.id} for patient ${patientId}:`, error);
      }
    }
  }

  private async evaluateRule(
    patientId: string,
    rule: ClinicalRule,
  ): Promise<RuleExecutionResult> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rule.windowDays);

    const measurements = await this.prisma.measurement.findMany({
      where: {
        patientId,
        type: this.mapMetricToMeasurementType(rule.metric),
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    if (measurements.length === 0) {
      return this.evaluateMissingData(rule);
    }

    switch (rule.condition.op) {
      case '>':
      case '<':
        return this.evaluateThreshold(measurements, rule);
      case 'trendUp':
      case 'trendDown':
        return this.evaluateTrend(measurements, rule);
      case 'volatile':
        return this.evaluateVolatility(measurements, rule);
      case 'missing':
        return this.evaluateMissingData(rule);
      default:
        return { triggered: false };
    }
  }

  private evaluateThreshold(
    measurements: any[],
    rule: ClinicalRule,
  ): RuleExecutionResult {
    const threshold = rule.condition.threshold || 0;
    const op = rule.condition.op as '>' | '<';

    const recentValues = this.extractValues(measurements, rule.metric);
    if (recentValues.length === 0) {
      return { triggered: false };
    }

    const latestValue = recentValues[recentValues.length - 1];
    const triggered = op === '>' ? latestValue > threshold : latestValue < threshold;

    if (triggered) {
      // Check if this is a persistent condition
      const days = rule.condition.days || 3;
      const recentDays = this.getRecentDays(measurements, days);
      const recentValuesInWindow = this.extractValues(recentDays, rule.metric);
      
      const allTriggered = recentValuesInWindow.every((v) =>
        op === '>' ? v > threshold : v < threshold,
      );

      if (allTriggered && recentValuesInWindow.length >= days) {
        return {
          triggered: true,
          value: latestValue,
          message: `${rule.metric} ${op} ${threshold} for ${days} days`,
        };
      }
    }

    return { triggered: false, value: latestValue };
  }

  private evaluateTrend(
    measurements: any[],
    rule: ClinicalRule,
  ): RuleExecutionResult {
    const values = this.extractValues(measurements, rule.metric);
    if (values.length < 2) {
      return { triggered: false };
    }

    const days = rule.condition.days || 5;
    const recentValues = values.slice(-days);
    
    // Calculate slope using linear regression
    const slope = this.calculateSlope(recentValues);
    const isRising = slope > 0;
    const isFalling = slope < 0;

    const op = rule.condition.op;
    const triggered =
      (op === 'trendUp' && isRising && Math.abs(slope) > 0.1) ||
      (op === 'trendDown' && isFalling && Math.abs(slope) > 0.1);

    return {
      triggered,
      value: values[values.length - 1],
      trend: slope,
      message: triggered
        ? `${rule.metric} trending ${op === 'trendUp' ? 'up' : 'down'} over ${days} days`
        : undefined,
    };
  }

  private evaluateVolatility(
    measurements: any[],
    rule: ClinicalRule,
  ): RuleExecutionResult {
    const values = this.extractValues(measurements, rule.metric);
    if (values.length < 3) {
      return { triggered: false };
    }

    const percentChange = rule.condition.percentChange || 10;
    const maxChange = Math.max(...values) - Math.min(...values);
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    const volatilityPercent = (maxChange / avgValue) * 100;

    const triggered = volatilityPercent > percentChange;

    return {
      triggered,
      value: values[values.length - 1],
      metadata: { volatilityPercent, maxChange, minChange: Math.min(...values) },
      message: triggered
        ? `${rule.metric} showing ${volatilityPercent.toFixed(1)}% volatility`
        : undefined,
    };
  }

  private evaluateMissingData(rule: ClinicalRule): RuleExecutionResult {
    const hours = rule.condition.threshold || 72; // Default 3 days
    return {
      triggered: true,
      message: `No ${rule.metric} data for ${hours} hours`,
    };
  }

  private extractValues(measurements: any[], metric: MetricType): number[] {
    return measurements
      .map((m) => {
        const value = m.value;
        if (typeof value === 'number') {
          return value;
        }
        if (typeof value === 'object' && value !== null) {
          // For BP, use systolic; for other metrics, try to extract numeric value
          if (metric === 'bp' && 'systolic' in value) {
            return value.systolic as number;
          }
          // Try to find first numeric value
          const numericValue = Object.values(value).find((v) => typeof v === 'number');
          return numericValue as number | undefined;
        }
        return undefined;
      })
      .filter((v): v is number => v !== undefined);
  }

  private getRecentDays(measurements: any[], days: number): any[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return measurements.filter((m) => new Date(m.timestamp) >= cutoff);
  }

  private calculateSlope(values: number[]): number {
    if (values.length < 2) return 0;
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private mapMetricToMeasurementType(metric: MetricType): string {
    const mapping: Record<MetricType, string> = {
      bp: 'BLOOD_PRESSURE',
      glucose: 'GLUCOSE',
      weight: 'WEIGHT',
      sleep: 'SLEEP',
      hrv: 'HRV',
      a1c: 'A1C',
    };
    return mapping[metric] || metric.toUpperCase();
  }

  private async executeAction(
    patientId: string,
    rule: ClinicalRule,
    result: RuleExecutionResult,
  ): Promise<void> {
    switch (rule.action) {
      case 'alert':
        await this.createAlert(patientId, rule, result);
        break;
      case 'suggest_visit':
        await this.suggestVisit(patientId, rule, result);
        break;
      case 'assign_task':
        await this.assignTask(patientId, rule, result);
        break;
      case 'assign_content':
        await this.assignContent(patientId, rule, result);
        break;
    }
  }

  private async createAlert(
    patientId: string,
    rule: ClinicalRule,
    result: RuleExecutionResult,
  ): Promise<void> {
    const severityMap: Record<Severity, AlertSeverity> = {
      info: AlertSeverity.INFO,
      warn: AlertSeverity.WARNING,
      critical: AlertSeverity.CRITICAL,
    };

    const alertTypeMap: Record<MetricType, AlertType> = {
      bp: AlertType.BP_HIGH_TREND,
      glucose: AlertType.GLUCOSE_HIGH,
      weight: AlertType.MEDICATION_ADHERENCE, // Reuse for now
      sleep: AlertType.NO_DATA, // Reuse
      hrv: AlertType.NO_DATA, // Reuse
      a1c: AlertType.GLUCOSE_HIGH, // Reuse
    };

    // Check if alert already exists
    const existing = await this.prisma.alert.findFirst({
      where: {
        patientId,
        type: alertTypeMap[rule.metric],
        status: 'ACTIVE',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (existing) {
      return; // Don't create duplicate alerts
    }

    await this.alertsService.create(patientId, {
      severity: severityMap[rule.severity],
      type: alertTypeMap[rule.metric],
      title: rule.name,
      body: result.message || rule.description || `Rule triggered: ${rule.name}`,
      payload: {
        ruleId: rule.id,
        metric: rule.metric,
        value: result.value,
        trend: result.trend,
        ...result.metadata,
      },
    });
  }

  private async suggestVisit(
    patientId: string,
    rule: ClinicalRule,
    result: RuleExecutionResult,
  ): Promise<void> {
    // Check if visit request already exists
    const existing = await this.prisma.visitRequest.findFirst({
      where: {
        patientId,
        status: 'PENDING',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    if (existing) {
      return;
    }

    await this.visitRequestsService.create(patientId, {
      type: rule.severity === 'critical' ? 'PROVIDER' : 'MA_CHECK',
      notes: `Suggested by rule: ${rule.name}. ${result.message}`,
    });
  }

  private async assignTask(
    patientId: string,
    rule: ClinicalRule,
    result: RuleExecutionResult,
  ): Promise<void> {
    // This would integrate with care plans to add tasks
    // For now, we'll create an alert that can be converted to a task
    const taskType = rule.actionParams?.taskType || 'TRACKING';
    const taskTitle = rule.actionParams?.title || `Monitor ${rule.metric}`;

    await this.alertsService.create(patientId, {
      severity: AlertSeverity.INFO,
      type: AlertType.MEDICATION_ADHERENCE, // Reuse
      title: `Task: ${taskTitle}`,
      body: rule.description || `Please complete: ${taskTitle}`,
      payload: {
        ruleId: rule.id,
        taskType,
        action: 'assign_task',
      },
    });
  }

  private async assignContent(
    patientId: string,
    rule: ClinicalRule,
    result: RuleExecutionResult,
  ): Promise<void> {
    const contentModule = rule.actionParams?.contentModule || 'general';
    
    // Create an alert that can trigger content assignment in the app
    await this.alertsService.create(patientId, {
      severity: AlertSeverity.INFO,
      type: AlertType.MEDICATION_ADHERENCE, // Reuse
      title: 'New content available',
      body: `We've prepared personalized content for you about ${rule.metric}`,
      payload: {
        ruleId: rule.id,
        contentModule,
        action: 'assign_content',
      },
    });
  }

  async createRule(data: Partial<ClinicalRule>): Promise<ClinicalRule> {
    return this.prisma.clinicalRule.create({
      data: data as any,
    }) as any;
  }

  async getRules(): Promise<ClinicalRule[]> {
    return this.prisma.clinicalRule.findMany({
      orderBy: { priority: 'desc' },
    }) as any;
  }

  async updateRule(id: string, data: Partial<ClinicalRule>): Promise<ClinicalRule> {
    return this.prisma.clinicalRule.update({
      where: { id },
      data: data as any,
    }) as any;
  }

  async deleteRule(id: string): Promise<void> {
    await this.prisma.clinicalRule.delete({
      where: { id },
    });
  }
}

