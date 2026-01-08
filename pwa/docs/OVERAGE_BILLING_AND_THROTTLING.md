# Overage Billing and Throttling

## Overview

MyHealthAlly implements a **soft limit with overage billing** model for AI interactions. This means:

1. **Users can exceed their monthly limit** - requests are not blocked
2. **Overage usage is tracked** - every interaction over the limit is recorded
3. **Overage charges are calculated** - at the end of each billing period
4. **Charges are added to next invoice** - via Stripe invoice items

## How It Works

### 1. Usage Tracking

Every AI interaction is tracked in the `ai_usage_tracking` table:
- User ID or subscription ID
- Interaction type (chat, symptom analysis, etc.)
- Tokens used
- Cost in cents
- Billing period

### 2. Real-Time Throttling Check

Before each AI request, the system checks:

```typescript
const throttleResult = await throttleAIUsage(
  subscriptionId,
  practiceSubscriptionId,
  userId,
  policy
);
```

**Policies:**
- `allow_with_billing` (default) - Allow overage, track for billing
- `block` - Hard limit, block all requests when exceeded
- `throttle` - Allow but rate-limit when exceeded

### 3. Overage Calculation

At the end of each billing period (monthly), the system:

1. **Calculates overage** for each active subscription:
   ```sql
   SELECT calculate_subscription_overage(subscription_id, period_start)
   ```

2. **Creates overage charge records** in `overage_charges` table:
   - Included interactions
   - Actual interactions
   - Overage interactions
   - Overage rate (cents per interaction)
   - Total charge (cents)

3. **Creates Stripe invoice items** for each overage:
   - Added to customer's next invoice
   - Automatically charged on next billing cycle

## Overage Rates

| Plan | Monthly Limit | Overage Rate |
|------|--------------|--------------|
| Individual/Wellness | 100 | $0.10 per interaction |
| Practice Starter | 15,000 | $0.008 per interaction |
| Practice Professional | 40,000 | $0.008 per interaction |
| Practice Enterprise | 100,000 | $0.008 per interaction |
| Enterprise Plus | Unlimited | $0.005 per interaction |

## Implementation Details

### Throttling Service

**File:** `pwa/lib/services/usage-throttle.ts`

- Checks usage limits before each AI request
- Returns `allowed: true/false` with reason
- Supports different policies (block, allow_with_billing, throttle)

### Overage Billing Service

**File:** `pwa/lib/services/overage-billing.ts`

- Calculates overage for subscriptions
- Creates overage charge records
- Returns overage calculations

### Automation Service

**File:** `pwa/lib/services/overage-billing-automation.ts`

- Processes all subscriptions at end of month
- Creates Stripe invoice items
- Updates charge status

## Monthly Billing Process

### Automated (Recommended)

Set up a cron job to run at the end of each month:

```typescript
import { processMonthlyOverages } from '@/lib/services/overage-billing-automation';

// Run on last day of month at 11:59 PM
await processMonthlyOverages();
```

### Manual

You can also trigger it manually via API:

```bash
POST /api/admin/process-overages
```

## User Experience

### When Limit is Reached

**Individual Plans:**
- User sees: "You've exceeded your monthly limit. Additional interactions will be charged at $0.10 per interaction."
- Requests continue to work
- Usage is tracked for billing

**Practice Plans:**
- Similar message with $0.008 per interaction
- All team members' usage counts toward limit
- Admin dashboard shows usage and projected overage

### Billing Notification

Users receive:
1. **Email notification** when overage is calculated
2. **Stripe invoice** with overage line item
3. **Dashboard notification** showing overage amount

## Example Calculation

**Practice Professional Plan:**
- Monthly limit: 40,000 interactions
- Actual usage: 45,000 interactions
- Overage: 5,000 interactions
- Overage rate: $0.008 per interaction
- **Total overage charge: $40.00**

This $40 is added to the next monthly invoice.

## Configuration

### Change Overage Policy

Edit `pwa/lib/services/usage-policies.ts`:

```typescript
export function getOveragePolicy(planId: string): OveragePolicy {
  if (planId === 'individual') {
    return 'block'; // Change to hard limit
  }
  return 'allow_with_billing';
}
```

### Change Overage Rates

Edit `pwa/supabase/migrations/015_pricing_and_usage_tracking.sql`:

```sql
UPDATE plans 
SET ai_overage_rate_cents = 10  -- $0.10
WHERE id = 'individual';
```

## Monitoring

### Check Current Usage

```typescript
import { getUsageSummary, checkUsageLimit } from '@/lib/services/ai-usage-tracking';

const usage = await getUsageSummary(userId);
const limit = await checkUsageLimit(userId);

console.log(`${usage.totalInteractions} / ${limit.limit} interactions used`);
```

### View Pending Overages

```typescript
import { getPendingOverageCharges } from '@/lib/services/overage-billing';

const pending = await getPendingOverageCharges();
console.log(`$${(pending.totalChargeCents / 100).toFixed(2)} in pending overages`);
```

## FAQ

**Q: Can users disable overage billing?**
A: No, but they can upgrade to a plan with higher limits.

**Q: What happens if payment fails for overage?**
A: The subscription remains active, but overage charges are marked as 'failed' and retried.

**Q: Can overages be waived?**
A: Yes, admins can update `overage_charges.status` to 'waived' in the database.

**Q: Are overages prorated?**
A: No, overages are calculated monthly based on the full billing period.

---

**Last Updated:** January 2025
