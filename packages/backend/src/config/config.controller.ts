import { Controller, Get } from '@nestjs/common';

@Controller('config')
export class ConfigController {
  @Get('metrics')
  getMetricsConfig() {
    // Return available metrics configuration for dynamic measurement tracking
    return {
      metrics: [
        {
          id: 'weight',
          label: 'Weight',
          unit: 'kg',
          input_type: 'numeric',
          min: 0,
          max: 500,
        },
        {
          id: 'bmi',
          label: 'BMI',
          unit: '',
          input_type: 'numeric',
          min: 10,
          max: 60,
        },
        {
          id: 'heart_rate',
          label: 'Heart Rate',
          unit: 'bpm',
          input_type: 'numeric',
          min: 30,
          max: 220,
        },
        {
          id: 'systolic_bp',
          label: 'Systolic BP',
          unit: 'mmHg',
          input_type: 'numeric',
          min: 50,
          max: 250,
        },
        {
          id: 'diastolic_bp',
          label: 'Diastolic BP',
          unit: 'mmHg',
          input_type: 'numeric',
          min: 30,
          max: 150,
        },
        {
          id: 'hrv',
          label: 'HRV (RMSSD)',
          unit: 'ms',
          input_type: 'numeric',
          min: 0,
          max: 200,
        },
        {
          id: 'spo2',
          label: 'SpO2',
          unit: '%',
          input_type: 'numeric',
          min: 70,
          max: 100,
        },
        {
          id: 'respiration',
          label: 'Respiration Rate',
          unit: 'breaths/min',
          input_type: 'numeric',
          min: 8,
          max: 40,
        },
        {
          id: 'sleep_hours',
          label: 'Sleep',
          unit: 'hours',
          input_type: 'numeric',
          min: 0,
          max: 24,
        },
        {
          id: 'steps',
          label: 'Steps',
          unit: 'steps',
          input_type: 'numeric',
          min: 0,
          max: 100000,
        },
        {
          id: 'glucose',
          label: 'Blood Glucose',
          unit: 'mg/dL',
          input_type: 'numeric',
          min: 50,
          max: 500,
        },
        {
          id: 'pain',
          label: 'Pain Level',
          unit: '0-10',
          input_type: 'scale',
          min: 0,
          max: 10,
        },
        {
          id: 'mood',
          label: 'Mood',
          unit: '',
          input_type: 'select',
          options: ['Excellent', 'Good', 'Fair', 'Poor'],
        },
        {
          id: 'energy',
          label: 'Energy Level',
          unit: '0-10',
          input_type: 'scale',
          min: 0,
          max: 10,
        },
        {
          id: 'stress',
          label: 'Stress Level',
          unit: '0-10',
          input_type: 'scale',
          min: 0,
          max: 10,
        },
      ],
    };
  }
}

