export type MetricType = 'bp' | 'glucose' | 'weight' | 'sleep' | 'hrv' | 'a1c';
export type ConditionOp = '>' | '<' | 'trendUp' | 'trendDown' | 'missing' | 'volatile';
export type Severity = 'info' | 'warn' | 'critical';
export type ActionType = 'alert' | 'suggest_visit' | 'assign_task' | 'assign_content';

export interface ClinicalRuleCondition {
  op: ConditionOp;
  threshold?: number;
  days?: number; // For trend operations
  percentChange?: number; // For volatility
}

export interface ClinicalRule {
  id: string;
  name: string;
  description?: string;
  metric: MetricType;
  windowDays: number;
  condition: ClinicalRuleCondition;
  severity: Severity;
  action: ActionType;
  actionParams?: Record<string, any>;
  enabled: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleExecutionResult {
  triggered: boolean;
  value?: number;
  trend?: number;
  message?: string;
  metadata?: Record<string, any>;
}

