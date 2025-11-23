import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: Generate random number in range
function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Generate random float in range
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Helper: Generate date N days ago
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Helper: Generate realistic BP with trend
function generateBP(day: number, baseline: { systolic: number; diastolic: number }): { systolic: number; diastolic: number } {
  const drift = Math.sin(day / 7) * 5; // Weekly pattern
  const volatility = (Math.random() - 0.5) * 10;
  return {
    systolic: Math.round(baseline.systolic + drift + volatility),
    diastolic: Math.round(baseline.diastolic + drift * 0.6 + volatility * 0.6),
  };
}

// Helper: Generate realistic glucose with trend
function generateGlucose(day: number, baseline: number): number {
  const drift = Math.sin(day / 7) * 15; // Weekly pattern
  const volatility = (Math.random() - 0.5) * 20;
  const mealSpike = Math.random() > 0.7 ? random(20, 40) : 0; // Occasional meal spike
  return Math.round(baseline + drift + volatility + mealSpike);
}

// Helper: Generate realistic weight with trend
function generateWeight(day: number, baseline: number, trend: 'down' | 'stable' | 'up'): number {
  const weeklyDrift = trend === 'down' ? -0.2 : trend === 'up' ? 0.2 : 0;
  const volatility = (Math.random() - 0.5) * 1.5;
  return Math.round((baseline + (weeklyDrift * day) + volatility) * 10) / 10;
}

async function main() {
  console.log('🌱 Seeding database with comprehensive test data...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  // await prisma.measurement.deleteMany();
  // await prisma.alert.deleteMany();
  // await prisma.message.deleteMany();
  // await prisma.messageThread.deleteMany();
  // await prisma.visitRequest.deleteMany();
  // await prisma.carePlan.deleteMany();
  // await prisma.patient.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.clinic.deleteMany();

  // 1. Create Clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: 'ohimaa-medical-001' },
    update: {},
    create: {
      id: 'ohimaa-medical-001',
      name: 'Ohimaa Medical',
    },
  });
  console.log('✓ Clinic created: Ohimaa Medical');

  const passwordHash = await bcrypt.hash('demo123', 10);

  // 2. Create Staff Accounts
  const clinician = await prisma.user.upsert({
    where: { email: 'dr@example.com' },
    update: {},
    create: {
      email: 'dr@example.com',
      passwordHash,
      role: 'PROVIDER',
      clinicId: clinic.id,
    },
  });
  console.log('✓ Clinician created: dr@example.com / demo123');

  const ma = await prisma.user.upsert({
    where: { email: 'ma@example.com' },
    update: {},
    create: {
      email: 'ma@example.com',
      passwordHash,
      role: 'MEDICAL_ASSISTANT',
      clinicId: clinic.id,
    },
  });
  console.log('✓ MA created: ma@example.com / demo123');

  // 3. Create Patients
  const patients = [
    {
      firstName: 'John',
      lastName: 'Davis',
      email: 'john.davis@example.com',
      condition: 'HTN',
      flags: ['HYPERTENSION'],
      bpBaseline: { systolic: 145, diastolic: 92 },
      glucoseBaseline: 95,
      weightBaseline: 185,
      weightTrend: 'stable' as const,
    },
    {
      firstName: 'Maria',
      lastName: 'Torres',
      email: 'maria.torres@example.com',
      condition: 'DM2',
      flags: ['DIABETES_TYPE_2'],
      bpBaseline: { systolic: 128, diastolic: 78 },
      glucoseBaseline: 165,
      weightBaseline: 210,
      weightTrend: 'down' as const,
    },
    {
      firstName: 'Samir',
      lastName: 'Patel',
      email: 'samir.patel@example.com',
      condition: 'Weight loss',
      flags: ['WEIGHT_MANAGEMENT'],
      bpBaseline: { systolic: 122, diastolic: 75 },
      glucoseBaseline: 88,
      weightBaseline: 245,
      weightTrend: 'down' as const,
    },
    {
      firstName: 'Keisha',
      lastName: 'Bannister',
      email: 'keisha.bannister@example.com',
      condition: 'Mood/sleep',
      flags: ['MENTAL_HEALTH', 'SLEEP_DISORDER'],
      bpBaseline: { systolic: 118, diastolic: 72 },
      glucoseBaseline: 92,
      weightBaseline: 155,
      weightTrend: 'stable' as const,
    },
    {
      firstName: 'Alex',
      lastName: 'Kim',
      email: 'alex.kim@example.com',
      condition: 'Wellness',
      flags: ['WELLNESS'],
      bpBaseline: { systolic: 115, diastolic: 70 },
      glucoseBaseline: 85,
      weightBaseline: 170,
      weightTrend: 'stable' as const,
    },
  ];

  const createdPatients = [];

  for (const patientData of patients) {
    const userPasswordHash = await bcrypt.hash('demo123', 10);
    const user = await prisma.user.upsert({
      where: { email: patientData.email },
      update: {},
      create: {
        email: patientData.email,
        passwordHash: userPasswordHash,
        role: 'PATIENT',
        clinicId: clinic.id,
      },
    });

    const patient = await prisma.patient.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        clinicId: clinic.id,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dateOfBirth: new Date(1970 + random(20, 50), random(0, 11), random(1, 28)),
        flags: patientData.flags,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { patientId: patient.id },
    });

    createdPatients.push({ ...patient, ...patientData });
    console.log(`✓ Patient created: ${patientData.firstName} ${patientData.lastName} (${patientData.condition})`);
  }

  // 4. Generate 30 days of vitals for each patient
  console.log('\n📊 Generating 30 days of vitals...');
  for (const patient of createdPatients) {
    const measurements = [];
    
    for (let day = 30; day >= 0; day--) {
      const timestamp = daysAgo(day);
      const bp = generateBP(day, patient.bpBaseline);
      const glucose = generateGlucose(day, patient.glucoseBaseline);
      const weight = generateWeight(day, patient.weightBaseline, patient.weightTrend);
      const sleepHours = randomFloat(5.5, 8.5);
      const steps = random(3000, 12000);
      const moodScore = random(1, 10);
      const heartRate = random(60, 85);

      // Blood pressure (daily)
      measurements.push({
        patientId: patient.id,
        type: 'BLOOD_PRESSURE',
        value: bp,
        timestamp,
        source: 'manual',
      });

      // Glucose (daily, sometimes 2x for DM2 patients)
      measurements.push({
        patientId: patient.id,
        type: 'GLUCOSE',
        value: glucose,
        timestamp,
        source: 'manual',
      });

      if (patient.condition === 'DM2' && Math.random() > 0.5) {
        // Second reading later in day
        const afternoonTimestamp = new Date(timestamp);
        afternoonTimestamp.setHours(14, 0, 0, 0);
        measurements.push({
          patientId: patient.id,
          type: 'GLUCOSE',
          value: generateGlucose(day, patient.glucoseBaseline + 30),
          timestamp: afternoonTimestamp,
          source: 'manual',
        });
      }

      // Weight (every 2-3 days)
      if (day % random(2, 3) === 0) {
        measurements.push({
          patientId: patient.id,
          type: 'WEIGHT',
          value: weight,
          timestamp,
          source: 'manual',
        });
      }

      // Sleep (daily)
      measurements.push({
        patientId: patient.id,
        type: 'SLEEP',
        value: sleepHours,
        timestamp,
        source: 'manual',
      });

      // Steps (daily)
      measurements.push({
        patientId: patient.id,
        type: 'STEPS',
        value: steps,
        timestamp,
        source: 'manual',
      });

      // Note: Mood tracking would be stored in metadata or as a separate field
      // For now, we'll skip mood as a separate measurement type

      // Heart rate (daily)
      measurements.push({
        patientId: patient.id,
        type: 'HEART_RATE',
        value: heartRate,
        timestamp,
        source: 'manual',
      });
    }

    await prisma.measurement.createMany({
      data: measurements,
      skipDuplicates: true,
    });
  }
  console.log('✓ 30 days of vitals generated for all patients');

  // 5. Create Alerts based on vitals
  console.log('\n🚨 Generating alerts...');
  for (const patient of createdPatients) {
    const alerts = [];

    // High BP alert (for HTN patient)
    if (patient.condition === 'HTN') {
      alerts.push({
        patientId: patient.id,
        severity: 'WARNING',
        type: 'BP_HIGH_TREND',
        title: 'Blood Pressure Above Target',
        body: 'Your blood pressure has been consistently above your target range. Please continue monitoring and follow your medication schedule.',
        status: 'ACTIVE',
        createdAt: daysAgo(3),
      });
    }

    // Rising glucose alert (for DM2 patient)
    if (patient.condition === 'DM2') {
      alerts.push({
        patientId: patient.id,
        severity: 'WARNING',
        type: 'GLUCOSE_HIGH',
        title: 'Elevated Glucose Levels',
        body: 'Your glucose readings have been elevated over the past week. Consider reviewing your diet and medication timing.',
        status: 'ACTIVE',
        createdAt: daysAgo(5),
      });
    }

    // Missed readings alert
    alerts.push({
      patientId: patient.id,
      severity: 'INFO',
      type: 'NO_DATA',
      title: 'Missing Recent Readings',
      body: 'We haven\'t received your blood pressure reading in the past 2 days. Please log your readings to help us track your progress.',
      status: 'ACTIVE',
      createdAt: daysAgo(1),
    });

    // Poor sleep alert (for mood/sleep patient)
    if (patient.condition === 'Mood/sleep') {
      alerts.push({
        patientId: patient.id,
        severity: 'WARNING',
        type: 'SLEEP_POOR',
        title: 'Sleep Quality Concerns',
        body: 'Your sleep duration has been below 6 hours for several nights. Consider establishing a consistent bedtime routine.',
        status: 'ACTIVE',
        createdAt: daysAgo(4),
      });
    }

    // Low mood alert
    if (patient.condition === 'Mood/sleep') {
      alerts.push({
        patientId: patient.id,
        severity: 'WARNING',
        type: 'MOOD_LOW',
        title: 'Mood Tracking',
        body: 'Your mood scores have been lower than usual. Remember that your care team is here to support you.',
        status: 'ACTIVE',
        createdAt: daysAgo(2),
      });
    }

    await prisma.alert.createMany({
      data: alerts,
      skipDuplicates: true,
    });
  }
  console.log('✓ Alerts generated (2+ per patient)');

  // 6. Create Care Plans
  console.log('\n📋 Creating care plans...');
  for (const patient of createdPatients) {
    let planDescription = '';
    let tasks: any[] = [];

    if (patient.condition === 'HTN') {
      planDescription = '3-month hypertension management plan focusing on medication adherence, diet, and regular monitoring.';
      tasks = [
        { title: 'Take blood pressure medication daily', type: 'MEDICATION', status: 'DUE' },
        { title: 'Limit sodium to < 2g per day', type: 'DIET', status: 'DUE' },
        { title: 'Walk 30 minutes, 5x per week', type: 'EXERCISE', status: 'DUE' },
        { title: 'Log BP reading twice daily', type: 'MONITORING', status: 'DUE' },
      ];
    } else if (patient.condition === 'DM2') {
      planDescription = '3-month diabetes management plan focusing on glucose control, weight loss, and lifestyle changes.';
      tasks = [
        { title: 'Check glucose before meals and at bedtime', type: 'MONITORING', status: 'DUE' },
        { title: 'Follow carbohydrate counting guidelines', type: 'DIET', status: 'DUE' },
        { title: 'Aim for 10,000 steps daily', type: 'EXERCISE', status: 'DUE' },
        { title: 'Take metformin with meals', type: 'MEDICATION', status: 'DUE' },
      ];
    } else if (patient.condition === 'Weight loss') {
      planDescription = '3-month weight management plan with gradual, sustainable weight loss goals.';
      tasks = [
        { title: 'Track all meals in app', type: 'DIET', status: 'DUE' },
        { title: 'Aim for 1-2 lbs weight loss per week', type: 'WEIGHT', status: 'DUE' },
        { title: 'Exercise 45 minutes, 4x per week', type: 'EXERCISE', status: 'DUE' },
        { title: 'Weigh yourself weekly', type: 'MONITORING', status: 'DUE' },
      ];
    } else if (patient.condition === 'Mood/sleep') {
      planDescription = '3-month mental wellness plan focusing on sleep hygiene, mood tracking, and stress management.';
      tasks = [
        { title: 'Maintain consistent sleep schedule (10pm-6am)', type: 'SLEEP', status: 'DUE' },
        { title: 'Practice mindfulness 10 minutes daily', type: 'MENTAL_HEALTH', status: 'DUE' },
        { title: 'Log mood score each morning', type: 'MONITORING', status: 'DUE' },
        { title: 'Limit screen time 1 hour before bed', type: 'SLEEP', status: 'DUE' },
      ];
    } else {
      planDescription = '3-month wellness maintenance plan to support overall health and prevent chronic conditions.';
      tasks = [
        { title: 'Maintain regular exercise routine', type: 'EXERCISE', status: 'DUE' },
        { title: 'Eat balanced meals with plenty of vegetables', type: 'DIET', status: 'DUE' },
        { title: 'Get 7-8 hours of sleep nightly', type: 'SLEEP', status: 'DUE' },
        { title: 'Annual wellness check-up scheduled', type: 'APPOINTMENT', status: 'DUE' },
      ];
    }

    // Check if care plan exists, if not create it
    const existingPlan = await prisma.carePlan.findFirst({
      where: { patientId: patient.id },
    });

    if (!existingPlan) {
      await prisma.carePlan.create({
        data: {
          patientId: patient.id,
          phases: [
            {
              phase: 1,
              name: 'Foundation & Baseline',
              progress: random(60, 80),
              tasks: tasks.map((t, i) => ({
                id: `task-${i + 1}`,
                ...t,
                dueDate: daysAgo(30 - (i * 7)),
              })),
            },
          ],
        },
      });
    }
  }
  console.log('✓ Care plans created for all patients');

  // 7. Create Message Threads and Messages
  console.log('\n💬 Seeding messages...');
  for (const patient of createdPatients) {
    // Create thread with clinician
    const thread = await prisma.messageThread.create({
      data: {
        patientId: patient.id,
        clinicId: clinic.id,
        subject: `Care plan discussion - ${patient.firstName}`,
        participants: [clinician.id, patient.userId] as any,
      },
    });

    const messages = [
      {
        threadId: thread.id,
        senderId: clinician.id,
        content: `Hi ${patient.firstName}, I wanted to check in on how you're doing with your care plan. How are you feeling?`,
        createdAt: daysAgo(10),
      },
      {
        threadId: thread.id,
        senderId: patient.userId,
        content: `Hi Dr. Smith, I'm doing well overall. I've been keeping up with my medication and trying to stay active.`,
        createdAt: daysAgo(9),
      },
      {
        threadId: thread.id,
        senderId: clinician.id,
        content: `That's great to hear! Keep up the excellent work. Remember to log your readings daily so we can track your progress.`,
        createdAt: daysAgo(8),
      },
      {
        threadId: thread.id,
        senderId: patient.userId,
        content: `Will do! I have a question about my medication timing - should I take it with breakfast or before?`,
        createdAt: daysAgo(7),
      },
      {
        threadId: thread.id,
        senderId: clinician.id,
        content: `Take it with breakfast to help with absorption and reduce any stomach upset. Let me know if you have any other questions!`,
        createdAt: daysAgo(6),
      },
      {
        threadId: thread.id,
        senderId: patient.userId,
        content: `Thank you! That helps a lot.`,
        createdAt: daysAgo(5),
      },
      {
        threadId: thread.id,
        senderId: clinician.id,
        content: `You're welcome! Keep up the great work with your health goals.`,
        createdAt: daysAgo(4),
      },
      {
        threadId: thread.id,
        senderId: patient.userId,
        content: `I've been logging my readings more consistently this week.`,
        createdAt: daysAgo(3),
      },
      {
        threadId: thread.id,
        senderId: clinician.id,
        content: `Excellent! I can see your readings in the system. Your numbers are looking good.`,
        createdAt: daysAgo(2),
      },
      {
        threadId: thread.id,
        senderId: patient.userId,
        content: `That's encouraging! I'll keep it up.`,
        createdAt: daysAgo(1),
      },
    ];

    await prisma.message.createMany({
      data: messages,
      skipDuplicates: true,
    });

    // Update thread with last message
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: {
        lastMessageAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
    });
  }
  console.log('✓ Messages seeded (10 per patient)');

  // 8. Create Visit Requests
  console.log('\n📅 Creating visit requests...');
  try {
    for (const patient of createdPatients) {
      // Scheduled visit (future) - AWAITING_PATIENT_CONFIRMATION
      await prisma.visitRequest.create({
        data: {
          patientId: patient.id,
          requestType: 'SCHEDULED',
          visitMode: 'IN_PERSON',
          requestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          reasonText: 'Follow-up appointment to review progress',
          reasonCategory: 'FOLLOW_UP',
          status: 'AWAITING_PATIENT_CONFIRMATION',
          severity: 'GREEN',
        },
      });

      // New request - TRIAGED
      await prisma.visitRequest.create({
        data: {
          patientId: patient.id,
          requestType: 'WALK_IN',
          visitMode: 'VIRTUAL',
          reasonText: 'Requested check-in regarding medication questions',
          reasonCategory: 'MEDICATION_QUESTION',
          status: 'TRIAGED',
          severity: 'YELLOW',
        },
      });
    }
    console.log('✓ Visit requests created (1 scheduled + 1 pending per patient)');
  } catch (error: any) {
    console.warn('⚠️  Visit requests creation skipped:', error.message);
    console.log('   (This is okay if the schema has changed - you can create visit requests manually)');
  }

  console.log('\n✅ Seeding complete!');
  console.log('\n📋 Test Accounts:');
  console.log('  Clinician: dr@example.com / demo123');
  console.log('  MA:        ma@example.com / demo123');
  console.log('  Patients:  [firstname].[lastname]@example.com / demo123');
  console.log('    - john.davis@example.com (HTN)');
  console.log('    - maria.torres@example.com (DM2)');
  console.log('    - samir.patel@example.com (Weight loss)');
  console.log('    - keisha.bannister@example.com (Mood/sleep)');
  console.log('    - alex.kim@example.com (Wellness)');
  console.log('\n📊 Data Summary:');
  console.log('  - 1 Clinic (Ohimaa Medical)');
  console.log('  - 2 Staff accounts');
  console.log('  - 5 Patients with full profiles');
  console.log('  - 30 days of vitals per patient');
  console.log('  - 2+ Alerts per patient');
  console.log('  - Care plans for all patients');
  console.log('  - 10 Messages per patient');
  console.log('  - 2 Visit requests per patient');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
