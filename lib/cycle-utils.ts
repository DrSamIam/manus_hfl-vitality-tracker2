/**
 * Cycle tracking utilities for period prediction, fertile window, and ovulation estimates
 */

export interface CycleData {
  startDate: string;
  endDate?: string;
  cycleLength?: number;
}

export interface CyclePrediction {
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  ovulationDate: Date;
  currentPhase: "menstrual" | "follicular" | "ovulation" | "luteal";
  daysUntilNextPeriod: number;
  daysUntilOvulation: number;
}

/**
 * Calculate average cycle length from historical data
 */
export function calculateAverageCycleLength(cycles: CycleData[]): number {
  if (cycles.length < 2) return 28; // Default to 28 days

  const cycleLengths: number[] = [];
  for (let i = 1; i < cycles.length; i++) {
    const prevStart = new Date(cycles[i - 1].startDate);
    const currentStart = new Date(cycles[i].startDate);
    const length = Math.round((currentStart.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));
    if (length >= 21 && length <= 35) {
      cycleLengths.push(length);
    }
  }

  if (cycleLengths.length === 0) return 28;
  return Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
}

/**
 * Calculate average period length from historical data
 */
export function calculateAveragePeriodLength(cycles: CycleData[]): number {
  const periodLengths = cycles
    .filter((c) => c.startDate && c.endDate)
    .map((c) => {
      const start = new Date(c.startDate);
      const end = new Date(c.endDate!);
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    })
    .filter((length) => length >= 2 && length <= 10);

  if (periodLengths.length === 0) return 5; // Default to 5 days
  return Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length);
}

/**
 * Get current cycle day based on last period start date
 */
export function getCurrentCycleDay(lastPeriodStart: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Determine current cycle phase
 */
export function getCurrentPhase(
  cycleDay: number,
  cycleLength: number,
  periodLength: number
): "menstrual" | "follicular" | "ovulation" | "luteal" {
  const ovulationDay = cycleLength - 14; // Ovulation typically occurs 14 days before next period

  if (cycleDay <= periodLength) {
    return "menstrual";
  } else if (cycleDay < ovulationDay - 2) {
    return "follicular";
  } else if (cycleDay <= ovulationDay + 1) {
    return "ovulation";
  } else {
    return "luteal";
  }
}

/**
 * Calculate full cycle prediction
 */
export function predictCycle(cycles: CycleData[]): CyclePrediction | null {
  if (cycles.length === 0) return null;

  const avgCycleLength = calculateAverageCycleLength(cycles);
  const avgPeriodLength = calculateAveragePeriodLength(cycles);

  // Get the most recent cycle start
  const sortedCycles = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const lastPeriodStart = new Date(sortedCycles[0].startDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycleDay = getCurrentCycleDay(lastPeriodStart);
  const currentPhase = getCurrentPhase(cycleDay, avgCycleLength, avgPeriodLength);

  // Calculate next period start
  const nextPeriodStart = new Date(lastPeriodStart);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + avgCycleLength);

  // If next period is in the past, calculate the one after
  while (nextPeriodStart < today) {
    nextPeriodStart.setDate(nextPeriodStart.getDate() + avgCycleLength);
  }

  // Calculate next period end
  const nextPeriodEnd = new Date(nextPeriodStart);
  nextPeriodEnd.setDate(nextPeriodEnd.getDate() + avgPeriodLength - 1);

  // Calculate ovulation (14 days before next period)
  const ovulationDate = new Date(nextPeriodStart);
  ovulationDate.setDate(ovulationDate.getDate() - 14);

  // Calculate fertile window (5 days before ovulation to 1 day after)
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);

  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);

  // Calculate days until events
  const daysUntilNextPeriod = Math.ceil(
    (nextPeriodStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let daysUntilOvulation = Math.ceil(
    (ovulationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If ovulation already passed this cycle, calculate for next cycle
  if (daysUntilOvulation < 0) {
    const nextOvulation = new Date(nextPeriodStart);
    nextOvulation.setDate(nextOvulation.getDate() + avgCycleLength - 14);
    daysUntilOvulation = Math.ceil(
      (nextOvulation.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    nextPeriodStart,
    nextPeriodEnd,
    fertileWindowStart,
    fertileWindowEnd,
    ovulationDate,
    currentPhase,
    daysUntilNextPeriod,
    daysUntilOvulation,
  };
}

/**
 * Get phase color for UI
 */
export function getPhaseColor(phase: string): string {
  switch (phase) {
    case "menstrual":
      return "#E11D48"; // Red
    case "follicular":
      return "#F59E0B"; // Amber
    case "ovulation":
      return "#10B981"; // Green
    case "luteal":
      return "#6366F1"; // Indigo
    default:
      return "#6B7280"; // Gray
  }
}

/**
 * Get phase description
 */
export function getPhaseDescription(phase: string): string {
  switch (phase) {
    case "menstrual":
      return "Menstrual Phase - Period days. Energy may be lower.";
    case "follicular":
      return "Follicular Phase - Energy rising. Good time for new projects.";
    case "ovulation":
      return "Ovulation Phase - Peak energy and fertility window.";
    case "luteal":
      return "Luteal Phase - Energy declining. Focus on self-care.";
    default:
      return "";
  }
}

/**
 * Format date for display
 */
export function formatPredictionDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
