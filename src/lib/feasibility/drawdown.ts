/**
 * Drawdown Engine — month-by-month drawn balance and interest accrual per facility.
 *
 * Pure function: takes resolved facilities + monthly project costs.
 * No imports from calculations.ts or cashflow.ts to avoid circular deps.
 */

export interface ResolvedFacility {
  id: string;
  name: string;
  size: number;
  interestRate: number;
  landLoanType: string;
  priority: string;
  sortOrder: number;
}

export interface DrawdownMonth {
  month: number;
  label: string;
  costsDrawn: number;
  interestAccrued: number;
  capitalised: number;
  cumulativeDrawn: number;
  availableBalance: number;
}

export interface FacilityDrawdown {
  facilityId: string;
  facilityName: string;
  facilitySize: number;
  interestRate: number;
  landLoanType: string;
  months: DrawdownMonth[];
  totalInterest: number;
  peakDrawn: number;
}

const PRIORITY_ORDER: Record<string, number> = {
  senior: 1,
  mezzanine: 2,
  junior: 3,
};

/**
 * Compute month-by-month drawdown schedule for each facility.
 *
 * Items with a funding_facility_id draw directly from their assigned facility.
 * Unassigned costs draw sequentially by priority (senior first).
 * Interest accrues on the drawn balance at the end of each month.
 * Provisioned facilities capitalise interest (added to drawn balance).
 * Serviced facilities accrue interest separately (not added to balance).
 *
 * @param assignedCosts - Map of facility ID → monthly cost array for explicitly assigned items
 */
export function computeDrawdowns(
  facilities: ResolvedFacility[],
  monthlyCosts: number[],
  monthLabels?: string[],
  assignedCosts?: Map<string, number[]>
): FacilityDrawdown[] {
  if (facilities.length === 0 || monthlyCosts.length === 0) return [];

  const sorted = [...facilities].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 99;
    const pb = PRIORITY_ORDER[b.priority] ?? 99;
    return pa - pb || a.sortOrder - b.sortOrder;
  });

  // Unassigned costs = total costs minus all assigned costs
  const remaining = [...monthlyCosts];
  if (assignedCosts) {
    for (const costs of assignedCosts.values()) {
      for (let i = 0; i < remaining.length && i < costs.length; i++) {
        remaining[i] -= costs[i];
      }
    }
    // Floor at zero — assigned costs shouldn't exceed total
    for (let i = 0; i < remaining.length; i++) {
      remaining[i] = Math.max(0, remaining[i]);
    }
  }

  const results: FacilityDrawdown[] = [];

  for (const f of sorted) {
    const monthlyRate = (f.interestRate || 0) / 100 / 12;
    const isProvisioned = f.landLoanType === "provisioned";
    let cumDrawn = 0;
    let totalInterest = 0;
    let peak = 0;
    const months: DrawdownMonth[] = [];

    // Get assigned costs for this facility (if any)
    const facilityAssigned = assignedCosts?.get(f.id);

    for (let i = 0; i < monthlyCosts.length; i++) {
      const avail = Math.max(0, f.size - cumDrawn);

      // Assigned costs for this facility this month + unassigned overflow
      const assigned = facilityAssigned?.[i] ?? 0;
      const fromAssigned = Math.min(assigned, avail);
      const availAfterAssigned = Math.max(0, avail - fromAssigned);

      // Draw from unassigned pool (only if this facility has room)
      const fromUnassigned = Math.min(Math.max(0, remaining[i]), availAfterAssigned);
      remaining[i] -= fromUnassigned;

      const drawn = fromAssigned + fromUnassigned;
      cumDrawn += drawn;

      // Interest on balance after this month's draw
      const interest = Math.round(cumDrawn * monthlyRate);
      totalInterest += interest;

      // Provisioned: capitalise interest (add to drawn balance up to facility limit)
      let cap = 0;
      if (isProvisioned && interest > 0) {
        const capRoom = Math.max(0, f.size - cumDrawn);
        cap = Math.min(interest, capRoom);
        cumDrawn += cap;
      }

      peak = Math.max(peak, cumDrawn);

      months.push({
        month: i + 1,
        label: monthLabels?.[i] ?? `M${i + 1}`,
        costsDrawn: drawn,
        interestAccrued: interest,
        capitalised: cap,
        cumulativeDrawn: cumDrawn,
        availableBalance: Math.max(0, f.size - cumDrawn),
      });
    }

    results.push({
      facilityId: f.id,
      facilityName: f.name,
      facilitySize: f.size,
      interestRate: f.interestRate,
      landLoanType: f.landLoanType,
      months,
      totalInterest,
      peakDrawn: peak,
    });
  }

  return results;
}
