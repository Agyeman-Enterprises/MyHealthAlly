/**
 * Patient Education Resources
 * MyHealth Ally - Resources Index
 * 
 * These resources provide evidence-based patient education
 * for chronic disease management and health monitoring.
 */

export interface EducationResource {
  id: string;
  title: string;
  subtitle: string;
  category: ResourceCategory;
  conditions: string[];  // Relevant conditions
  icon: string;         // Icon name for display
  filename: string;     // Markdown file name
  estimatedReadTime: number; // minutes
  lastUpdated: string;
}

export type ResourceCategory = 
  | 'respiratory'
  | 'pediatric'
  | 'chronic-disease'
  | 'general-wellness';

export const EDUCATION_RESOURCES: EducationResource[] = [
  {
    id: 'copd-management',
    title: 'Understanding Your COPD',
    subtitle: 'A Patient Guide Based on GOLD 2025 Guidelines',
    category: 'respiratory',
    conditions: ['copd', 'copd_severe', 'chronic_bronchitis', 'emphysema'],
    icon: 'lungs',
    filename: 'copd-management-guide.md',
    estimatedReadTime: 12,
    lastUpdated: '2024-12',
  },
  {
    id: 'asthma-action-plan',
    title: 'My Asthma Action Plan',
    subtitle: 'Zone-Based Management Guide',
    category: 'respiratory',
    conditions: ['asthma'],
    icon: 'clipboard-list',
    filename: 'asthma-action-plan-guide.md',
    estimatedReadTime: 8,
    lastUpdated: '2024-12',
  },
  {
    id: 'asthma-self-management',
    title: 'Living Well with Asthma',
    subtitle: 'Complete Self-Management Guide',
    category: 'respiratory',
    conditions: ['asthma'],
    icon: 'heart-pulse',
    filename: 'asthma-self-management-guide.md',
    estimatedReadTime: 15,
    lastUpdated: '2024-12',
  },
  {
    id: 'newborn-warning-signs',
    title: 'New Parent Guide',
    subtitle: 'Warning Signs in Your Newborn',
    category: 'pediatric',
    conditions: ['newborn', 'infant'],
    icon: 'baby',
    filename: 'newborn-warning-signs-guide.md',
    estimatedReadTime: 10,
    lastUpdated: '2024-12',
  },
];

/**
 * Get resources relevant to a patient's conditions
 */
export function getResourcesForConditions(conditions: string[]): EducationResource[] {
  if (!conditions || conditions.length === 0) {
    return EDUCATION_RESOURCES;
  }
  
  return EDUCATION_RESOURCES.filter(resource =>
    resource.conditions.some(c => 
      conditions.some(pc => 
        pc.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(pc.toLowerCase())
      )
    )
  );
}

/**
 * Get resources by category
 */
export function getResourcesByCategory(category: ResourceCategory): EducationResource[] {
  return EDUCATION_RESOURCES.filter(r => r.category === category);
}

/**
 * Get a single resource by ID
 */
export function getResourceById(id: string): EducationResource | undefined {
  return EDUCATION_RESOURCES.find(r => r.id === id);
}

/**
 * Category display information
 */
export const RESOURCE_CATEGORIES: Record<ResourceCategory, { label: string; icon: string; color: string }> = {
  'respiratory': {
    label: 'Respiratory Health',
    icon: 'wind',
    color: 'blue',
  },
  'pediatric': {
    label: 'Pediatric Care',
    icon: 'baby',
    color: 'pink',
  },
  'chronic-disease': {
    label: 'Chronic Disease Management',
    icon: 'activity',
    color: 'purple',
  },
  'general-wellness': {
    label: 'General Wellness',
    icon: 'heart',
    color: 'green',
  },
};

/**
 * Quick reference cards data
 */
export const QUICK_REFERENCE = {
  copd: {
    oxygenTarget: '88-92%',
    callBelow: '85%',
    dangerSigns: [
      'Severe shortness of breath at rest',
      'Blue lips or fingernails',
      'Confusion',
      'Cannot speak in full sentences',
    ],
  },
  asthma: {
    greenZone: '80-100% of personal best',
    yellowZone: '50-80% of personal best',
    redZone: 'Below 50% of personal best',
    rescueLimit: '2-3 times per week',
  },
  newborn: {
    feverThreshold: '100.4°F (38°C)',
    normalHR: '100-160 bpm',
    normalRR: '30-60 breaths/min',
    normalSpO2: '≥95%',
    wetDiapers: '6+ per day (after day 4)',
  },
};
