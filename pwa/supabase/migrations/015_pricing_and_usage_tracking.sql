-- Migration: 015_pricing_and_usage_tracking.sql
-- Purpose: Add new pricing plans, practice subscriptions, and AI usage tracking

-- 1. Ensure plans table exists (create if it doesn't)
CREATE TABLE IF NOT EXISTS plans (
  id text primary key,
  name text not null,
  price_monthly_cents integer not null,
  price_annual_cents integer,
  description text,
  limits jsonb,
  household_size integer,
  active boolean default true,
  created_at timestamptz default now()
);

-- 2. Update plans table with new pricing structure
-- Add new columns for practice plans (safe - uses IF NOT EXISTS)
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'plan_type') THEN
    ALTER TABLE plans ADD COLUMN plan_type VARCHAR(50) DEFAULT 'individual';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'max_providers') THEN
    ALTER TABLE plans ADD COLUMN max_providers INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'max_patients') THEN
    ALTER TABLE plans ADD COLUMN max_patients INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'max_ai_interactions') THEN
    ALTER TABLE plans ADD COLUMN max_ai_interactions INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'ai_overage_rate_cents') THEN
    ALTER TABLE plans ADD COLUMN ai_overage_rate_cents INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'annual_discount_percent') THEN
    ALTER TABLE plans ADD COLUMN annual_discount_percent INTEGER DEFAULT 0;
  END IF;
END $$;

-- Insert new pricing plans (keeping old ones for backward compatibility)
INSERT INTO plans (id, name, price_monthly_cents, price_annual_cents, description, plan_type, max_providers, max_patients, max_ai_interactions, ai_overage_rate_cents, annual_discount_percent, limits, active)
VALUES
  -- Individual/Wellness Plan
  (
    'individual',
    'Individual / Wellness',
    999, -- $9.99
    10788, -- $107.88 (10% discount)
    'Personal health tracking and wellness features',
    'individual',
    1, -- Self only
    1,
    100,
    10, -- $0.10 per additional interaction
    10,
    '{"ai_interactions": 100}'::jsonb,
    true
  ),
  -- Practice Plans
  (
    'practice-starter',
    'Practice Starter',
    19900, -- $199.00
    214920, -- $2,149.20 (10% discount)
    'Perfect for small practices getting started',
    'practice-starter',
    3,
    500,
    15000,
    8, -- $0.008 per additional interaction
    10,
    '{"providers": 3, "patients": 500, "ai_interactions": 15000}'::jsonb,
    true
  ),
  (
    'practice-professional',
    'Practice Professional',
    39900, -- $399.00
    406980, -- $4,069.80 (15% discount)
    'For growing practices with advanced needs',
    'practice-professional',
    10,
    1000,
    40000,
    8, -- $0.008 per additional interaction
    15,
    '{"providers": 10, "patients": 1000, "ai_interactions": 40000}'::jsonb,
    true
  ),
  (
    'practice-enterprise',
    'Practice Enterprise',
    59900, -- $599.00
    575040, -- $5,750.40 (20% discount)
    'For large practices requiring unlimited scale',
    'practice-enterprise',
    NULL, -- Unlimited
    NULL, -- Unlimited
    100000,
    8, -- $0.008 per additional interaction
    20,
    '{"providers": "unlimited", "patients": "unlimited", "ai_interactions": 100000}'::jsonb,
    true
  ),
  (
    'enterprise-plus',
    'Enterprise Plus',
    0, -- Custom pricing
    NULL,
    'Custom solutions for health systems and large enterprises',
    'enterprise-plus',
    NULL, -- Unlimited
    NULL, -- Unlimited
    NULL, -- Unlimited or custom
    5, -- $0.005 per additional interaction (lower rate for high volume)
    0,
    '{"providers": "unlimited", "patients": "unlimited", "ai_interactions": "unlimited"}'::jsonb,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly_cents = EXCLUDED.price_monthly_cents,
  price_annual_cents = EXCLUDED.price_annual_cents,
  description = EXCLUDED.description,
  plan_type = EXCLUDED.plan_type,
  max_providers = EXCLUDED.max_providers,
  max_patients = EXCLUDED.max_patients,
  max_ai_interactions = EXCLUDED.max_ai_interactions,
  ai_overage_rate_cents = EXCLUDED.ai_overage_rate_cents,
  annual_discount_percent = EXCLUDED.annual_discount_percent,
  limits = EXCLUDED.limits;

-- 2. Ensure subscriptions table exists (for foreign key reference)
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_id text not null,
  status text default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Add practice subscription support
-- Practices can have subscriptions (different from user subscriptions)
CREATE TABLE IF NOT EXISTS practice_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id VARCHAR(255) NOT NULL,
  plan_id TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, canceled, past_due, trialing
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, annual
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_subscriptions_practice_id ON practice_subscriptions(practice_id);
CREATE INDEX IF NOT EXISTS idx_practice_subscriptions_status ON practice_subscriptions(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_practice_subscriptions_stripe_sub ON practice_subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- Add foreign key constraints for practice_subscriptions (after tables are created)
DO $$
BEGIN
  -- Add practice_id foreign key if practices table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'practices') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'practice_subscriptions' 
      AND constraint_name = 'practice_subscriptions_practice_id_fkey'
    ) THEN
      ALTER TABLE practice_subscriptions 
        ADD CONSTRAINT practice_subscriptions_practice_id_fkey 
        FOREIGN KEY (practice_id) REFERENCES practices(practice_id) ON DELETE CASCADE;
    END IF;
  END IF;
  
  -- Add plan_id foreign key (plans table should exist now)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'practice_subscriptions' 
    AND constraint_name = 'practice_subscriptions_plan_id_fkey'
  ) THEN
    ALTER TABLE practice_subscriptions 
      ADD CONSTRAINT practice_subscriptions_plan_id_fkey 
      FOREIGN KEY (plan_id) REFERENCES plans(id);
  END IF;
END $$;

-- 4. AI Usage Tracking
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Track by subscription (for practices) or user (for individuals)
  subscription_id UUID,
  practice_subscription_id UUID,
  user_id UUID, -- For individual plans
  
  -- Usage details
  interaction_type VARCHAR(50) NOT NULL, -- 'chat', 'symptom_analysis', 'discharge_parse', etc.
  tokens_used INTEGER DEFAULT 0, -- Total tokens consumed
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0, -- Cost in cents
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional context (model used, etc.)
  
  -- Period tracking
  period_start DATE NOT NULL, -- Billing period start
  period_end DATE NOT NULL, -- Billing period end
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_subscription ON ai_usage_tracking(subscription_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ai_usage_practice_sub ON ai_usage_tracking(practice_subscription_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_tracking(user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ai_usage_period ON ai_usage_tracking(period_start, period_end);

-- Add foreign key constraints for ai_usage_tracking
DO $$
BEGIN
  -- Add subscription_id foreign key if subscriptions table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'ai_usage_tracking' 
      AND constraint_name = 'ai_usage_tracking_subscription_id_fkey'
    ) THEN
      ALTER TABLE ai_usage_tracking 
        ADD CONSTRAINT ai_usage_tracking_subscription_id_fkey 
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE;
    END IF;
  END IF;
  
  -- Add practice_subscription_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'ai_usage_tracking' 
    AND constraint_name = 'ai_usage_tracking_practice_subscription_id_fkey'
  ) THEN
    ALTER TABLE ai_usage_tracking 
      ADD CONSTRAINT ai_usage_tracking_practice_subscription_id_fkey 
      FOREIGN KEY (practice_subscription_id) REFERENCES practice_subscriptions(id) ON DELETE CASCADE;
  END IF;
  
  -- Add user_id foreign key if users table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'ai_usage_tracking' 
      AND constraint_name = 'ai_usage_tracking_user_id_fkey'
    ) THEN
      ALTER TABLE ai_usage_tracking 
        ADD CONSTRAINT ai_usage_tracking_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 4. Usage Summary View (for quick queries)
CREATE OR REPLACE VIEW ai_usage_summary AS
SELECT 
  COALESCE(ps.practice_id, s.user_id::text, u.id::text) as entity_id,
  COALESCE(ps.id, s.id) as subscription_id,
  ps.practice_id,
  s.user_id,
  DATE_TRUNC('month', CURRENT_DATE) as period_start,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' as period_end,
  COUNT(*) as total_interactions,
  SUM(tokens_used) as total_tokens,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(cost_cents) as total_cost_cents
FROM ai_usage_tracking aut
LEFT JOIN practice_subscriptions ps ON aut.practice_subscription_id = ps.id
LEFT JOIN subscriptions s ON aut.subscription_id = s.id
LEFT JOIN users u ON aut.user_id = u.id
WHERE aut.period_start = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY COALESCE(ps.practice_id, s.user_id::text, u.id::text), COALESCE(ps.id, s.id), ps.practice_id, s.user_id;

-- 5. Overage Billing Table
CREATE TABLE IF NOT EXISTS overage_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID,
  practice_subscription_id UUID,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  included_interactions INTEGER NOT NULL,
  actual_interactions INTEGER NOT NULL,
  overage_interactions INTEGER NOT NULL,
  overage_rate_cents INTEGER NOT NULL,
  total_charge_cents INTEGER NOT NULL,
  stripe_invoice_id TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, invoiced, paid, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_overage_subscription ON overage_charges(subscription_id, period_start);
CREATE INDEX IF NOT EXISTS idx_overage_practice_sub ON overage_charges(practice_subscription_id, period_start);
CREATE INDEX IF NOT EXISTS idx_overage_status ON overage_charges(status);

-- Add foreign key constraints for overage_charges
DO $$
BEGIN
  -- Add subscription_id foreign key if subscriptions table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'overage_charges' 
      AND constraint_name = 'overage_charges_subscription_id_fkey'
    ) THEN
      ALTER TABLE overage_charges 
        ADD CONSTRAINT overage_charges_subscription_id_fkey 
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE;
    END IF;
  END IF;
  
  -- Add practice_subscription_id foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'overage_charges' 
    AND constraint_name = 'overage_charges_practice_subscription_id_fkey'
  ) THEN
    ALTER TABLE overage_charges 
      ADD CONSTRAINT overage_charges_practice_subscription_id_fkey 
      FOREIGN KEY (practice_subscription_id) REFERENCES practice_subscriptions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. RLS Policies
ALTER TABLE practice_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE overage_charges ENABLE ROW LEVEL SECURITY;

-- Practice subscriptions: readable by practice admins and service role
DROP POLICY IF EXISTS "practice_subscriptions_read" ON practice_subscriptions;
CREATE POLICY "practice_subscriptions_read" ON practice_subscriptions
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    practice_id IN (
      SELECT practice_id FROM patients WHERE user_id = auth.uid()
    )
  );

-- AI usage tracking: readable by subscription owner
DROP POLICY IF EXISTS "ai_usage_tracking_read" ON ai_usage_tracking;
CREATE POLICY "ai_usage_tracking_read" ON ai_usage_tracking
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    user_id = auth.uid() OR
    subscription_id IN (SELECT id FROM subscriptions WHERE user_id = auth.uid()) OR
    practice_subscription_id IN (
      SELECT id FROM practice_subscriptions 
      WHERE practice_id IN (
        SELECT practice_id FROM patients WHERE user_id = auth.uid()
      )
    )
  );

-- Service role can insert/update usage tracking
DROP POLICY IF EXISTS "ai_usage_tracking_service_write" ON ai_usage_tracking;
CREATE POLICY "ai_usage_tracking_service_write" ON ai_usage_tracking
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (true);

-- Overage charges: readable by subscription owner
DROP POLICY IF EXISTS "overage_charges_read" ON overage_charges;
CREATE POLICY "overage_charges_read" ON overage_charges
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    subscription_id IN (SELECT id FROM subscriptions WHERE user_id = auth.uid()) OR
    practice_subscription_id IN (
      SELECT id FROM practice_subscriptions 
      WHERE practice_id IN (
        SELECT practice_id FROM patients WHERE user_id = auth.uid()
      )
    )
  );

-- Service role can manage overage charges
DROP POLICY IF EXISTS "overage_charges_service_all" ON overage_charges;
CREATE POLICY "overage_charges_service_all" ON overage_charges
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (true);

-- 7. Function to calculate overage for a subscription
CREATE OR REPLACE FUNCTION calculate_subscription_overage(
  p_subscription_id UUID,
  p_period_start DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)
)
RETURNS TABLE (
  included_interactions INTEGER,
  actual_interactions BIGINT,
  overage_interactions BIGINT,
  overage_rate_cents INTEGER,
  total_charge_cents BIGINT
) AS $$
DECLARE
  v_plan_id TEXT;
  v_max_interactions INTEGER;
  v_overage_rate INTEGER;
  v_actual_count BIGINT;
BEGIN
  -- Get plan details from subscription
  SELECT s.plan_id INTO v_plan_id
  FROM subscriptions s
  WHERE s.id = p_subscription_id;
  
  -- Get plan limits
  SELECT p.max_ai_interactions, p.ai_overage_rate_cents
  INTO v_max_interactions, v_overage_rate
  FROM plans p
  WHERE p.id = v_plan_id;
  
  -- Count actual interactions for period
  SELECT COUNT(*) INTO v_actual_count
  FROM ai_usage_tracking
  WHERE subscription_id = p_subscription_id
    AND period_start = p_period_start;
  
  -- Calculate overage
  RETURN QUERY SELECT
    COALESCE(v_max_interactions, 0)::INTEGER as included_interactions,
    COALESCE(v_actual_count, 0)::BIGINT as actual_interactions,
    GREATEST(0, COALESCE(v_actual_count, 0) - COALESCE(v_max_interactions, 0))::BIGINT as overage_interactions,
    COALESCE(v_overage_rate, 0)::INTEGER as overage_rate_cents,
    (GREATEST(0, COALESCE(v_actual_count, 0) - COALESCE(v_max_interactions, 0)) * COALESCE(v_overage_rate, 0))::BIGINT as total_charge_cents;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to calculate overage for practice subscription
CREATE OR REPLACE FUNCTION calculate_practice_overage(
  p_practice_subscription_id UUID,
  p_period_start DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)
)
RETURNS TABLE (
  included_interactions INTEGER,
  actual_interactions BIGINT,
  overage_interactions BIGINT,
  overage_rate_cents INTEGER,
  total_charge_cents BIGINT
) AS $$
DECLARE
  v_plan_id TEXT;
  v_max_interactions INTEGER;
  v_overage_rate INTEGER;
  v_actual_count BIGINT;
BEGIN
  -- Get plan details from practice subscription
  SELECT ps.plan_id INTO v_plan_id
  FROM practice_subscriptions ps
  WHERE ps.id = p_practice_subscription_id;
  
  -- Get plan limits
  SELECT p.max_ai_interactions, p.ai_overage_rate_cents
  INTO v_max_interactions, v_overage_rate
  FROM plans p
  WHERE p.id = v_plan_id;
  
  -- Count actual interactions for period
  SELECT COUNT(*) INTO v_actual_count
  FROM ai_usage_tracking
  WHERE practice_subscription_id = p_practice_subscription_id
    AND period_start = p_period_start;
  
  -- Calculate overage
  RETURN QUERY SELECT
    COALESCE(v_max_interactions, 0)::INTEGER as included_interactions,
    COALESCE(v_actual_count, 0)::BIGINT as actual_interactions,
    GREATEST(0, COALESCE(v_actual_count, 0) - COALESCE(v_max_interactions, 0))::BIGINT as overage_interactions,
    COALESCE(v_overage_rate, 0)::INTEGER as overage_rate_cents,
    (GREATEST(0, COALESCE(v_actual_count, 0) - COALESCE(v_max_interactions, 0)) * COALESCE(v_overage_rate, 0))::BIGINT as total_charge_cents;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
