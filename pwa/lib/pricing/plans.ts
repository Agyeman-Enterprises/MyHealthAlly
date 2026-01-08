/**
 * Pricing Plans Configuration
 * 
 * Based on market research and competitive analysis
 * Updated: January 2025
 */

export type PlanType = 'individual' | 'practice-starter' | 'practice-professional' | 'practice-enterprise' | 'enterprise-plus';

export interface PricingPlan {
  id: PlanType;
  name: string;
  description: string;
  price: number; // Monthly price in USD
  billingCycle: 'monthly' | 'annual';
  currency: string;
  
  // Limits
  maxProviders?: number;
  maxPatients?: number;
  maxAiInteractions?: number; // Per month
  aiOverageRate?: number; // Cost per additional interaction
  
  // Features
  features: string[];
  
  // Target market
  targetMarket: string;
  
  // Annual discount
  annualDiscount?: number; // Percentage discount for annual billing
}

export const PRICING_PLANS: Record<PlanType, PricingPlan> = {
  'individual': {
    id: 'individual',
    name: 'Individual / Wellness',
    description: 'Personal health tracking and wellness features',
    price: 9.99,
    billingCycle: 'monthly',
    currency: 'USD',
    maxPatients: 1, // Self only
    maxAiInteractions: 100, // Per month
    aiOverageRate: 0.10, // $0.10 per additional interaction
    features: [
      'Personal health tracking',
      'Voice input for all data entry',
      'Multi-language support',
      'Basic AI health assistant (100 interactions/month)',
      'Medication tracking',
      'Vitals logging',
      'Lab results storage',
      'Care plan creation',
      'Document storage (1GB)',
      'Mobile app access',
    ],
    targetMarket: 'Direct-to-consumer, wellness-focused individuals',
  },
  
  'practice-starter': {
    id: 'practice-starter',
    name: 'Practice Starter',
    description: 'Perfect for small practices getting started',
    price: 199,
    billingCycle: 'monthly',
    currency: 'USD',
    maxProviders: 3,
    maxPatients: 500,
    maxAiInteractions: 15000, // 15,000 per month
    aiOverageRate: 0.008, // $0.008 per additional interaction
    features: [
      'Up to 3 providers',
      'Up to 500 patients',
      '15,000 AI interactions/month',
      'Patient portal with voice input',
      'Multi-language support (award-winning)',
      'Real-time continuity of care alerts',
      'Appointment scheduling',
      'Secure messaging',
      'Lab results management',
      'Medication management',
      'Care plan collaboration',
      'Basic analytics dashboard',
      'Email support',
    ],
    targetMarket: 'Small practices (1-3 providers)',
    annualDiscount: 10, // 10% off for annual billing
  },
  
  'practice-professional': {
    id: 'practice-professional',
    name: 'Practice Professional',
    description: 'For growing practices with advanced needs',
    price: 399,
    billingCycle: 'monthly',
    currency: 'USD',
    maxProviders: 10,
    maxPatients: 1000,
    maxAiInteractions: 40000, // 40,000 per month
    aiOverageRate: 0.008, // $0.008 per additional interaction
    features: [
      'Up to 10 providers',
      'Up to 1,000 patients',
      '40,000 AI interactions/month',
      'All Starter features, plus:',
      'Provider marketplace integration',
      'Advanced analytics & reporting',
      'Custom care plan templates',
      'Bulk patient management',
      'API access',
      'Priority support',
      'Training & onboarding',
      'Custom branding options',
    ],
    targetMarket: 'Medium practices (4-10 providers)',
    annualDiscount: 15, // 15% off for annual billing
  },
  
  'practice-enterprise': {
    id: 'practice-enterprise',
    name: 'Practice Enterprise',
    description: 'For large practices requiring unlimited scale',
    price: 599,
    billingCycle: 'monthly',
    currency: 'USD',
    maxAiInteractions: 100000, // 100,000 per month
    aiOverageRate: 0.008, // $0.008 per additional interaction
    features: [
      'Unlimited providers',
      'Unlimited patients',
      '100,000 AI interactions/month',
      'All Professional features, plus:',
      'White-label options',
      'Advanced integrations (EHR, billing, etc.)',
      'Dedicated account manager',
      '24/7 priority support',
      'Custom development support',
      'SLA guarantees',
      'Advanced security & compliance',
      'Multi-location support',
      'Enterprise SSO',
    ],
    targetMarket: 'Large practices (10+ providers)',
    annualDiscount: 20, // 20% off for annual billing
  },
  
  'enterprise-plus': {
    id: 'enterprise-plus',
    name: 'Enterprise Plus',
    description: 'Custom solutions for health systems and large enterprises',
    price: 0, // Custom pricing
    billingCycle: 'monthly',
    currency: 'USD',
    aiOverageRate: 0.005, // Lower rate for high volume
    features: [
      'Everything in Enterprise, plus:',
      'Unlimited AI interactions',
      'On-premise deployment options',
      'Custom AI model training',
      'Dedicated infrastructure',
      'Custom integrations',
      'Professional services',
      'Compliance consulting',
      'Custom SLA terms',
      'Executive reporting',
      'Multi-tenant architecture',
    ],
    targetMarket: 'Health systems, large enterprises, multi-entity organizations',
  },
};

/**
 * Calculate annual price with discount
 */
export function getAnnualPrice(plan: PricingPlan): number {
  if (!plan.annualDiscount) {
    return plan.price * 12;
  }
  const monthlyWithDiscount = plan.price * (1 - plan.annualDiscount / 100);
  return monthlyWithDiscount * 12;
}

/**
 * Calculate cost for AI interaction overage
 */
export function calculateOverageCost(
  plan: PricingPlan,
  actualInteractions: number
): number {
  if (!plan.maxAiInteractions || !plan.aiOverageRate) {
    return 0;
  }
  
  if (actualInteractions <= plan.maxAiInteractions) {
    return 0;
  }
  
  const overage = actualInteractions - plan.maxAiInteractions;
  return overage * plan.aiOverageRate;
}

/**
 * Get plan by ID
 */
export function getPlan(planId: PlanType): PricingPlan {
  return PRICING_PLANS[planId];
}

/**
 * Get all available plans
 */
export function getAllPlans(): PricingPlan[] {
  return Object.values(PRICING_PLANS);
}

/**
 * Get plans for a specific market segment
 */
export function getPlansForMarket(market: 'individual' | 'practice' | 'enterprise'): PricingPlan[] {
  switch (market) {
    case 'individual':
      return [PRICING_PLANS.individual];
    case 'practice':
      return [
        PRICING_PLANS['practice-starter'],
        PRICING_PLANS['practice-professional'],
        PRICING_PLANS['practice-enterprise'],
      ];
    case 'enterprise':
      return [
        PRICING_PLANS['practice-enterprise'],
        PRICING_PLANS['enterprise-plus'],
      ];
    default:
      return getAllPlans();
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  if (price === 0) {
    return 'Custom Pricing';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Calculate total monthly cost including overage
 */
export function calculateTotalMonthlyCost(
  plan: PricingPlan,
  actualInteractions: number
): number {
  const basePrice = plan.price;
  const overageCost = calculateOverageCost(plan, actualInteractions);
  return basePrice + overageCost;
}
