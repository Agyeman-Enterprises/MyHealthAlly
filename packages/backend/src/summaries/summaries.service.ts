import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { AlertSeverity, AlertType } from '@myhealthally/shared';

interface SummaryData {
  bpTrend: {
    average: number;
    trend: 'up' | 'down' | 'stable';
    daysAboveTarget: number;
  };
  glucoseTrend: {
    average: number;
    trend: 'up' | 'down' | 'stable';
    daysAboveTarget: number;
  };
  weightTrend: {
    current: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  steps: {
    average: number;
    total: number;
  };
  sleep: {
    averageHours: number;
    quality: 'good' | 'fair' | 'poor';
  };
  adherence: {
    medications: number; // percentage
    tracking: number;
    habits: number;
  };
  recommendations: string[];
}

@Injectable()
export class SummariesService {
  private readonly logger = new Logger(SummariesService.name);

  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService,
  ) {}

  async generateWeeklySummary(patientId: string, weekStart: Date, weekEnd: Date): Promise<SummaryData> {
    // Get all measurements for the week
    const measurements = await this.prisma.measurement.findMany({
      where: {
        patientId,
        timestamp: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Get care plan for adherence calculation
    const carePlan = await this.prisma.carePlan.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    // Analyze BP
    const bpMeasurements = measurements.filter((m) => m.type === 'BLOOD_PRESSURE');
    const bpTrend = this.analyzeBPTrend(bpMeasurements);

    // Analyze Glucose
    const glucoseMeasurements = measurements.filter((m) => m.type === 'GLUCOSE');
    const glucoseTrend = this.analyzeGlucoseTrend(glucoseMeasurements);

    // Analyze Weight
    const weightMeasurements = measurements.filter((m) => m.type === 'WEIGHT');
    const weightTrend = this.analyzeWeightTrend(weightMeasurements);

    // Analyze Steps
    const stepsMeasurements = measurements.filter((m) => m.type === 'STEPS');
    const steps = this.analyzeSteps(stepsMeasurements);

    // Analyze Sleep
    const sleepMeasurements = measurements.filter((m) => m.type === 'SLEEP');
    const sleep = this.analyzeSleep(sleepMeasurements);

    // Calculate Adherence (simplified - would need task completion data)
    const adherence = this.calculateAdherence(carePlan, measurements);

    // Generate Recommendations
    const recommendations = this.generateRecommendations({
      bpTrend,
      glucoseTrend,
      weightTrend,
      steps,
      sleep,
      adherence,
    });

    return {
      bpTrend,
      glucoseTrend,
      weightTrend,
      steps,
      sleep,
      adherence,
      recommendations,
    };
  }

  private analyzeBPTrend(measurements: any[]): SummaryData['bpTrend'] {
    if (measurements.length === 0) {
      return { average: 0, trend: 'stable', daysAboveTarget: 0 };
    }

    const values = measurements.map((m) => {
      const value = m.value as any;
      if (typeof value === 'object' && value.systolic) {
        return value.systolic as number;
      }
      return 0;
    }).filter((v) => v > 0);

    if (values.length === 0) {
      return { average: 0, trend: 'stable', daysAboveTarget: 0 };
    }

    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const threshold = 130;
    const daysAboveTarget = this.countDaysAboveThreshold(measurements, threshold);

    // Simple trend calculation
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = secondAvg > firstAvg + 5 ? 'up' : secondAvg < firstAvg - 5 ? 'down' : 'stable';

    return { average, trend, daysAboveTarget };
  }

  private analyzeGlucoseTrend(measurements: any[]): SummaryData['glucoseTrend'] {
    if (measurements.length === 0) {
      return { average: 0, trend: 'stable', daysAboveTarget: 0 };
    }

    const values = measurements.map((m) => {
      const value = m.value as any;
      return typeof value === 'number' ? value : (value?.value as number) || 0;
    }).filter((v) => v > 0);

    if (values.length === 0) {
      return { average: 0, trend: 'stable', daysAboveTarget: 0 };
    }

    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const threshold = 140;
    const daysAboveTarget = this.countDaysAboveThreshold(measurements, threshold);

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = secondAvg > firstAvg + 5 ? 'up' : secondAvg < firstAvg - 5 ? 'down' : 'stable';

    return { average, trend, daysAboveTarget };
  }

  private analyzeWeightTrend(measurements: any[]): SummaryData['weightTrend'] {
    if (measurements.length === 0) {
      return { current: 0, change: 0, trend: 'stable' };
    }

    const values = measurements.map((m) => {
      const value = m.value as any;
      return typeof value === 'number' ? value : (value?.value as number) || 0;
    }).filter((v) => v > 0);

    if (values.length === 0) {
      return { current: 0, change: 0, trend: 'stable' };
    }

    const current = values[values.length - 1];
    const first = values[0];
    const change = current - first;
    const trend = change > 1 ? 'up' : change < -1 ? 'down' : 'stable';

    return { current, change, trend };
  }

  private analyzeSteps(measurements: any[]): SummaryData['steps'] {
    if (measurements.length === 0) {
      return { average: 0, total: 0 };
    }

    const values = measurements.map((m) => {
      const value = m.value as any;
      return typeof value === 'number' ? value : (value?.value as number) || 0;
    });

    const total = values.reduce((a, b) => a + b, 0);
    const average = total / measurements.length;

    return { average, total };
  }

  private analyzeSleep(measurements: any[]): SummaryData['sleep'] {
    if (measurements.length === 0) {
      return { averageHours: 0, quality: 'fair' };
    }

    const values = measurements.map((m) => {
      const value = m.value as any;
      return typeof value === 'number' ? value : (value?.hours as number) || 0;
    });

    const averageHours = values.reduce((a, b) => a + b, 0) / values.length;
    const quality = averageHours >= 7 ? 'good' : averageHours >= 6 ? 'fair' : 'poor';

    return { averageHours, quality };
  }

  private calculateAdherence(carePlan: any, measurements: any[]): SummaryData['adherence'] {
    // Simplified adherence calculation
    // In production, this would check task completion records
    const medicationCount = measurements.filter((m) => m.type === 'MEDICATION').length;
    const trackingCount = measurements.length;
    const habitCount = measurements.filter((m) => m.type === 'HABIT').length;

    // Assume 7 days, 1 medication per day, 2 tracking per day, 1 habit per day
    const medications = Math.min(100, (medicationCount / 7) * 100);
    const tracking = Math.min(100, (trackingCount / 14) * 100);
    const habits = Math.min(100, (habitCount / 7) * 100);

    return { medications, tracking, habits };
  }

  private countDaysAboveThreshold(measurements: any[], threshold: number): number {
    const days = new Set<string>();
    measurements.forEach((m) => {
      const value = m.value as any;
      const numValue = typeof value === 'number' ? value : (value?.systolic || value?.value || 0);
      if (numValue > threshold) {
        const date = new Date(m.timestamp).toDateString();
        days.add(date);
      }
    });
    return days.size;
  }

  private generateRecommendations(data: Partial<SummaryData>): string[] {
    const recommendations: string[] = [];

    if (data.bpTrend?.trend === 'up' || data.bpTrend?.daysAboveTarget > 3) {
      recommendations.push('Your blood pressure has been elevated. Consider scheduling a check-in with your care team.');
    }

    if (data.glucoseTrend?.trend === 'up' || data.glucoseTrend?.daysAboveTarget > 3) {
      recommendations.push('Your glucose levels have been above target. Review your medication and diet plan.');
    }

    if (data.weightTrend?.trend === 'up' && data.weightTrend.change > 2) {
      recommendations.push('You\'ve gained weight this week. Let\'s review your nutrition plan.');
    }

    if (data.steps?.average < 5000) {
      recommendations.push('Try to increase your daily steps. Aim for at least 7,500 steps per day.');
    }

    if (data.sleep?.quality === 'poor') {
      recommendations.push('Your sleep quality could be improved. Check out our sleep hygiene tips in the Coach section.');
    }

    if (data.adherence?.medications < 80) {
      recommendations.push('Medication adherence is important. Try setting reminders to take your medications on time.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job this week! Keep up the excellent work with your care plan.');
    }

    return recommendations;
  }

  async saveSummary(patientId: string, weekStart: Date, weekEnd: Date, summary: SummaryData) {
    return this.prisma.weeklySummary.upsert({
      where: {
        patientId_weekStart: {
          patientId,
          weekStart,
        },
      },
      create: {
        patientId,
        weekStart,
        weekEnd,
        summary: summary as any,
      },
      update: {
        weekEnd,
        summary: summary as any,
      },
    });
  }

  async getSummaries(patientId: string, limit: number = 10) {
    return this.prisma.weeklySummary.findMany({
      where: { patientId },
      orderBy: { weekStart: 'desc' },
      take: limit,
    });
  }

  async createSummaryAlert(patientId: string, summary: SummaryData) {
    const title = 'Your Weekly Health Summary';
    const body = `This week: BP ${summary.bpTrend.trend}, Glucose ${summary.glucoseTrend.trend}, Weight ${summary.weightTrend.trend === 'up' ? 'up' : summary.weightTrend.trend === 'down' ? 'down' : 'stable'}. ${summary.recommendations[0] || ''}`;

    await this.alertsService.create(patientId, {
      severity: AlertSeverity.INFO,
      type: AlertType.MEDICATION_ADHERENCE, // Reuse
      title,
      body,
      payload: {
        type: 'weekly_summary',
        summary,
      },
    });
  }
}

