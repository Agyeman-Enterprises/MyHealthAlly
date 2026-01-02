/**
 * Medication Refill Tracking Utilities
 * Calculates refill due dates and tracks remaining refills
 */

export interface RefillInfo {
  refillsRemaining: number | null;
  refillsTotal: number | null;
  lastRefillDate: string | null;
  daysSupply: number | null;
  nextRefillDueDate: string | null;
  isDueForRefill: boolean;
  daysUntilDue: number | null;
}

/**
 * Calculate next refill due date based on last refill date and days supply
 */
export function calculateNextRefillDueDate(
  lastRefillDate: string | null | undefined,
  daysSupply: number | null | undefined
): string | null {
  if (!lastRefillDate || !daysSupply) {
    return null;
  }

  try {
    const lastRefill = new Date(lastRefillDate);
    const nextDue = new Date(lastRefill);
    nextDue.setDate(nextDue.getDate() + daysSupply);
    return nextDue.toISOString().split('T')[0]; // Return as YYYY-MM-DD
  } catch {
    return null;
  }
}

/**
 * Calculate days until refill is due
 */
export function calculateDaysUntilDue(nextRefillDueDate: string | null): number | null {
  if (!nextRefillDueDate) {
    return null;
  }

  try {
    const dueDate = new Date(nextRefillDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch {
    return null;
  }
}

/**
 * Get comprehensive refill information for a medication
 */
export function getRefillInfo(
  refillsRemaining: number | null,
  lastRefillDate: string | null | undefined,
  daysSupply: number | null | undefined,
  refillsTotal?: number | null,
  nextRefillDueDateFromDb?: string | null
): RefillInfo {
  // Use next_refill_due_date from DB if available, otherwise calculate it
  const nextRefillDueDate = nextRefillDueDateFromDb || calculateNextRefillDueDate(lastRefillDate, daysSupply);
  const daysUntilDue = calculateDaysUntilDue(nextRefillDueDate);
  const isDueForRefill = daysUntilDue !== null && daysUntilDue <= 0;

  return {
    refillsRemaining,
    refillsTotal: refillsTotal || null,
    lastRefillDate: lastRefillDate || null,
    daysSupply: daysSupply || null,
    nextRefillDueDate,
    isDueForRefill,
    daysUntilDue,
  };
}

/**
 * Format refill status message for display
 */
export function formatRefillStatus(refillInfo: RefillInfo): string {
  if (refillInfo.refillsRemaining === null || refillInfo.refillsRemaining === undefined) {
    return 'Refill information not available';
  }

  if (refillInfo.refillsRemaining === 0) {
    return 'No refills remaining';
  }

  const refillsText = refillInfo.refillsRemaining === 1 
    ? '1 refill remaining' 
    : `${refillInfo.refillsRemaining} refills remaining`;

  if (refillInfo.nextRefillDueDate) {
    const daysUntilDue = refillInfo.daysUntilDue;
    if (daysUntilDue !== null) {
      if (daysUntilDue < 0) {
        return `${refillsText} • Due ${Math.abs(daysUntilDue)} days ago`;
      } else if (daysUntilDue === 0) {
        return `${refillsText} • Due today`;
      } else if (daysUntilDue <= 7) {
        return `${refillsText} • Due in ${daysUntilDue} days`;
      } else {
        const dueDate = new Date(refillInfo.nextRefillDueDate);
        return `${refillsText} • Next refill due ${dueDate.toLocaleDateString()}`;
      }
    }
  }

  return refillsText;
}

