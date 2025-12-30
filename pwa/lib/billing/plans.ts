export type PlanId = 'essential' | 'complete' | 'family' | 'premium';

export type PlanDefinition = {
  id: PlanId;
  name: string;
  monthly: number; // cents
  annual?: number; // cents
  description: string;
  features: string[];
  limits: {
    labs?: number | 'unlimited';
    refills?: number | 'unlimited';
    referrals?: number | 'unlimited';
    appointments?: number | 'unlimited';
  };
  stripePriceId?: string;
  householdSize?: number; // family plan
};

export const PLAN_DEFS: Record<PlanId, PlanDefinition> = {
  essential: {
    id: 'essential',
    name: 'Essential',
    monthly: 6900,
    description: 'For healthy adults who need occasional care.',
    features: [
      '2 lab orders / year',
      '4 prescription refills / year',
      '2 specialist referrals / year',
      'AI health Q&A (24/7)',
      'Symptom checker',
    ],
    limits: { labs: 2, refills: 4, referrals: 2, appointments: 0 },
  },
  complete: {
    id: 'complete',
    name: 'Complete',
    monthly: 12000,
    description: 'Unlimited access to labs, refills, referrals, and appointments.',
    features: [
      'Unlimited labs, refills, referrals',
      'Appointments & reminders',
      'AI health Q&A (24/7)',
      'Priority messaging',
    ],
    limits: { labs: 'unlimited', refills: 'unlimited', referrals: 'unlimited', appointments: 'unlimited' },
  },
  family: {
    id: 'family',
    name: 'Family',
    monthly: 19900,
    description: 'Complete access for up to 5 household members.',
    features: [
      'Includes all Complete benefits',
      'Up to 5 members',
      'Shared billing & management',
    ],
    limits: { labs: 'unlimited', refills: 'unlimited', referrals: 'unlimited', appointments: 'unlimited' },
    householdSize: 5,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    monthly: 29900,
    description: 'Concierge-level care with MD consults and priority response.',
    features: [
      'All Complete benefits',
      'Priority response SLA',
      'Quarterly MD video consultations',
    ],
    limits: { labs: 'unlimited', refills: 'unlimited', referrals: 'unlimited', appointments: 'unlimited' },
  },
};

export function getPlanById(id: PlanId): PlanDefinition {
  return PLAN_DEFS[id];
}

export const PRICE_ID_MAP: Partial<Record<PlanId, string | undefined>> = {
  essential: process.env['STRIPE_PRICE_ID_ESSENTIAL'],
  complete: process.env['STRIPE_PRICE_ID_COMPLETE'],
  family: process.env['STRIPE_PRICE_ID_FAMILY'],
  premium: process.env['STRIPE_PRICE_ID_PREMIUM'],
};
