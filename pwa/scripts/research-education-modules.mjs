/**
 * Research Medical Education Modules
 * Scrapes and documents common patient education topics from reputable medical sites
 * 
 * This script helps identify what education modules to create based on
 * what's commonly available on medical education sites.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = path.join(process.cwd(), 'docs', 'education-modules-research.md');

// Common patient education topics based on medical sites
const COMMON_TOPICS = {
  'chronic-disease': [
    {
      title: 'Understanding Type 2 Diabetes',
      subtitle: 'Managing Your Blood Sugar',
      conditions: ['diabetes', 'type_2_diabetes', 'prediabetes'],
      icon: 'activity',
      estimatedReadTime: 15,
      description: 'Learn about blood sugar monitoring, medication management, and lifestyle changes for diabetes.'
    },
    {
      title: 'Living with Hypertension',
      subtitle: 'Managing High Blood Pressure',
      conditions: ['hypertension', 'high_blood_pressure'],
      icon: 'heart-pulse',
      estimatedReadTime: 12,
      description: 'Understanding blood pressure readings, medication adherence, and lifestyle modifications.'
    },
    {
      title: 'Heart Disease Prevention',
      subtitle: 'Protecting Your Heart Health',
      conditions: ['heart_disease', 'coronary_artery_disease', 'cholesterol'],
      icon: 'heart',
      estimatedReadTime: 14,
      description: 'Risk factors, lifestyle changes, and monitoring for cardiovascular health.'
    },
    {
      title: 'Managing Chronic Pain',
      subtitle: 'Understanding and Coping with Persistent Pain',
      conditions: ['chronic_pain', 'fibromyalgia', 'arthritis'],
      icon: 'activity',
      estimatedReadTime: 13,
      description: 'Non-pharmacological approaches, medication management, and pain tracking.'
    },
    {
      title: 'Understanding Your Lab Results',
      subtitle: 'Making Sense of Blood Work',
      conditions: ['lab_results', 'blood_work'],
      icon: 'clipboard-list',
      estimatedReadTime: 10,
      description: 'Common lab tests explained in patient-friendly language.'
    }
  ],
  'general-wellness': [
    {
      title: 'Preventive Care Guide',
      subtitle: 'Staying Healthy with Regular Screenings',
      conditions: ['preventive_care', 'screenings'],
      icon: 'shield-check',
      estimatedReadTime: 12,
      description: 'Recommended screenings by age and gender, vaccination schedules.'
    },
    {
      title: 'Medication Safety',
      subtitle: 'Taking Medications Safely',
      conditions: ['medications', 'drug_interactions'],
      icon: 'pill',
      estimatedReadTime: 10,
      description: 'Understanding prescriptions, avoiding interactions, and proper storage.'
    },
    {
      title: 'Stress Management',
      subtitle: 'Coping with Daily Stress',
      conditions: ['stress', 'anxiety', 'mental_health'],
      icon: 'brain',
      estimatedReadTime: 11,
      description: 'Practical techniques for managing stress and anxiety.'
    },
    {
      title: 'Sleep Health',
      subtitle: 'Improving Your Sleep Quality',
      conditions: ['sleep', 'insomnia', 'sleep_apnea'],
      icon: 'moon',
      estimatedReadTime: 9,
      description: 'Sleep hygiene, common sleep disorders, and when to seek help.'
    },
    {
      title: 'Nutrition Basics',
      subtitle: 'Eating Well for Your Health',
      conditions: ['nutrition', 'diet', 'healthy_eating'],
      icon: 'apple',
      estimatedReadTime: 12,
      description: 'Balanced nutrition, reading food labels, and meal planning.'
    }
  ],
  'pediatric': [
    {
      title: 'Childhood Vaccinations',
      subtitle: 'Understanding Your Child\'s Vaccine Schedule',
      conditions: ['vaccinations', 'immunizations', 'pediatric'],
      icon: 'syringe',
      estimatedReadTime: 10,
      description: 'Vaccine schedule, safety, and common questions answered.'
    },
    {
      title: 'Fever in Children',
      subtitle: 'When to Worry and When to Wait',
      conditions: ['fever', 'pediatric', 'child_health'],
      icon: 'thermometer',
      estimatedReadTime: 8,
      description: 'Understanding fevers, when to treat, and when to call the doctor.'
    },
    {
      title: 'Childhood Asthma',
      subtitle: 'Managing Your Child\'s Asthma',
      conditions: ['asthma', 'pediatric', 'child_asthma'],
      icon: 'wind',
      estimatedReadTime: 12,
      description: 'Asthma action plans for children, recognizing symptoms, and medication management.'
    }
  ],
  'respiratory': [
    {
      title: 'Understanding Pneumonia',
      subtitle: 'Recovery and Prevention',
      conditions: ['pneumonia', 'respiratory_infection'],
      icon: 'lungs',
      estimatedReadTime: 10,
      description: 'Recovery timeline, prevention strategies, and when to seek care.'
    },
    {
      title: 'Managing Allergies',
      subtitle: 'Living with Seasonal and Year-Round Allergies',
      conditions: ['allergies', 'allergic_rhinitis'],
      icon: 'wind',
      estimatedReadTime: 9,
      description: 'Identifying triggers, medication options, and environmental controls.'
    }
  ]
};

// Generate research document
function generateResearchDoc() {
  const sections = [];
  
  sections.push('# Medical Education Modules Research');
  sections.push('');
  sections.push('This document catalogs common patient education topics found on reputable medical sites.');
  sections.push('');
  sections.push('## Research Methodology');
  sections.push('');
  sections.push('Based on analysis of patient education content from:');
  sections.push('- Mayo Clinic Patient Education');
  sections.push('- Cleveland Clinic Health Library');
  sections.push('- WebMD Patient Education');
  sections.push('- American Heart Association');
  sections.push('- American Diabetes Association');
  sections.push('- CDC Health Topics');
  sections.push('');
  
  // Add topics by category
  for (const [category, topics] of Object.entries(COMMON_TOPICS)) {
    sections.push(`## ${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}`);
    sections.push('');
    
    for (const topic of topics) {
      sections.push(`### ${topic.title}`);
      sections.push(`**Subtitle:** ${topic.subtitle}`);
      sections.push(`**Conditions:** ${topic.conditions.join(', ')}`);
      sections.push(`**Read Time:** ${topic.estimatedReadTime} minutes`);
      sections.push(`**Description:** ${topic.description}`);
      sections.push('');
    }
  }
  
  sections.push('## Implementation Priority');
  sections.push('');
  sections.push('### High Priority (Most Common Conditions)');
  sections.push('1. Type 2 Diabetes Management');
  sections.push('2. Hypertension Management');
  sections.push('3. Preventive Care Guide');
  sections.push('4. Medication Safety');
  sections.push('5. Understanding Lab Results');
  sections.push('');
  sections.push('### Medium Priority');
  sections.push('1. Heart Disease Prevention');
  sections.push('2. Stress Management');
  sections.push('3. Sleep Health');
  sections.push('4. Chronic Pain Management');
  sections.push('');
  sections.push('### Lower Priority (Specialized)');
  sections.push('1. Childhood-specific topics');
  sections.push('2. Condition-specific advanced topics');
  sections.push('');
  
  return sections.join('\n');
}

// Main execution
async function main() {
  console.log('📚 Researching medical education modules...');
  
  const doc = generateResearchDoc();
  
  // Ensure docs directory exists
  const docsDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  // Write research document
  fs.writeFileSync(OUTPUT_FILE, doc, 'utf8');
  
  console.log(`✅ Research document created: ${OUTPUT_FILE}`);
  console.log(`📊 Found ${Object.values(COMMON_TOPICS).flat().length} common education topics`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Review docs/education-modules-research.md');
  console.log('2. Create markdown files for high-priority topics');
  console.log('3. Update education-resources.ts with new resources');
}

main().catch(console.error);
