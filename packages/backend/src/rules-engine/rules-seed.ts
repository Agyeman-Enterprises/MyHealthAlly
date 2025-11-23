import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDefaultRules() {
  const defaultRules = [
    {
      name: 'BP High Trend (3 days)',
      description:
        'Blood pressure elevated above 130/80 for 3 consecutive days',
      metric: 'bp',
      windowDays: 7,
      condition: {
        op: '>',
        threshold: 130,
        days: 3,
      },
      severity: 'warn',
      action: 'alert',
      enabled: true,
      priority: 10,
    },
    {
      name: 'BP Critical High',
      description: 'Blood pressure critically high (systolic > 160)',
      metric: 'bp',
      windowDays: 1,
      condition: {
        op: '>',
        threshold: 160,
      },
      severity: 'critical',
      action: 'suggest_visit',
      enabled: true,
      priority: 20,
    },
    {
      name: 'BP Rising Trend',
      description: 'Blood pressure trending upward over 5 days',
      metric: 'bp',
      windowDays: 7,
      condition: {
        op: 'trendUp',
        days: 5,
      },
      severity: 'warn',
      action: 'alert',
      enabled: true,
      priority: 8,
    },
    {
      name: 'Glucose Persistent High',
      description: 'Glucose above 140 mg/dL despite medication adherence',
      metric: 'glucose',
      windowDays: 7,
      condition: {
        op: '>',
        threshold: 140,
        days: 5,
      },
      severity: 'warn',
      action: 'suggest_visit',
      enabled: true,
      priority: 12,
    },
    {
      name: 'Glucose Critical High',
      description: 'Glucose critically high (>250 mg/dL)',
      metric: 'glucose',
      windowDays: 1,
      condition: {
        op: '>',
        threshold: 250,
      },
      severity: 'critical',
      action: 'suggest_visit',
      enabled: true,
      priority: 25,
    },
    {
      name: 'Weight Volatility',
      description: 'Weight showing significant volatility (>10% change)',
      metric: 'weight',
      windowDays: 14,
      condition: {
        op: 'volatile',
        percentChange: 10,
      },
      severity: 'info',
      action: 'assign_content',
      actionParams: {
        contentModule: 'nutrition',
      },
      enabled: true,
      priority: 5,
    },
    {
      name: 'No Data - BP',
      description: 'No blood pressure data for 72 hours',
      metric: 'bp',
      windowDays: 3,
      condition: {
        op: 'missing',
        threshold: 72,
      },
      severity: 'info',
      action: 'assign_task',
      actionParams: {
        taskType: 'TRACKING',
        title: 'Check blood pressure',
      },
      enabled: true,
      priority: 3,
    },
    {
      name: 'No Data - Glucose',
      description: 'No glucose data for 48 hours',
      metric: 'glucose',
      windowDays: 2,
      condition: {
        op: 'missing',
        threshold: 48,
      },
      severity: 'info',
      action: 'assign_task',
      actionParams: {
        taskType: 'TRACKING',
        title: 'Check glucose',
      },
      enabled: true,
      priority: 3,
    },
    {
      name: 'Sleep Deterioration',
      description: 'Sleep quality trending downward',
      metric: 'sleep',
      windowDays: 7,
      condition: {
        op: 'trendDown',
        days: 5,
      },
      severity: 'info',
      action: 'assign_content',
      actionParams: {
        contentModule: 'sleep_hygiene',
      },
      enabled: true,
      priority: 4,
    },
    {
      name: 'HRV Deterioration',
      description: 'Heart rate variability declining',
      metric: 'hrv',
      windowDays: 7,
      condition: {
        op: 'trendDown',
        days: 5,
      },
      severity: 'warn',
      action: 'assign_content',
      actionParams: {
        contentModule: 'stress_management',
      },
      enabled: true,
      priority: 6,
    },
  ];

  for (const rule of defaultRules) {
    const existing = await prisma.clinicalRule.findFirst({
      where: { name: rule.name },
    });

    if (!existing) {
      await prisma.clinicalRule.create({
        data: rule as any,
      });
      console.log(`Created rule: ${rule.name}`);
    }
  }
}

if (require.main === module) {
  seedDefaultRules()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
