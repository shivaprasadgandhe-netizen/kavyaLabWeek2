/**
 * Date bucketing utilities for administrative analytics.
 * Pure logic module with NO Prisma or Next.js dependencies.
 */

export interface RawDayCount {
  day: Date | string;
  count: number | bigint;
}

export interface DateBucketPoint {
  date: string; // Display label (e.g., "Jan 01")
  isoDate: string; // Normalized key "YYYY-MM-DD"
  count: number;
}

export interface DateBucketsResult {
  buckets: DateBucketPoint[];
  rangeLabel: string;
  startDate: Date;
  endDate: Date;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/**
 * Builds an exact 30-day UTC array of signup counts, filling missing days with 0.
 *
 * Requirements:
 * - Exactly 30 points.
 * - Zero-signup days present with count 0.
 * - Ordered oldest to newest.
 * - Strictly aligned to UTC midnight boundaries.
 *
 * @param rawDailyCounts Array of { day, count } from database query
 * @param now Reference timestamp (defaults to current time)
 */
export function buildDateBuckets(
  rawDailyCounts: RawDayCount[] = [],
  now: Date = new Date()
): DateBucketsResult {
  // Normalize current date to UTC midnight
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  );

  // Exactly 29 days prior gives a 30-day window including today
  const startDateUTC = new Date(todayUTC);
  startDateUTC.setUTCDate(todayUTC.getUTCDate() - 29);

  // Map incoming daily counts by 'YYYY-MM-DD'
  const countMap = new Map<string, number>();
  for (const item of rawDailyCounts) {
    if (!item || item.day == null) continue;
    const d = item.day instanceof Date ? item.day : new Date(item.day);
    if (isNaN(d.getTime())) continue;

    // Use UTC date string YYYY-MM-DD
    const isoKey = d.toISOString().slice(0, 10);
    const prev = countMap.get(isoKey) || 0;
    countMap.set(isoKey, prev + Number(item.count || 0));
  }

  const buckets: DateBucketPoint[] = [];

  for (let i = 0; i < 30; i++) {
    const bucketDate = new Date(startDateUTC);
    bucketDate.setUTCDate(startDateUTC.getUTCDate() + i);

    const isoDate = bucketDate.toISOString().slice(0, 10);
    const month = MONTH_NAMES[bucketDate.getUTCMonth()];
    const dayOfMonth = String(bucketDate.getUTCDate()).padStart(2, "0");
    const label = `${month} ${dayOfMonth}`;

    buckets.push({
      date: label,
      isoDate,
      count: countMap.get(isoDate) ?? 0,
    });
  }

  const first = buckets[0];
  const last = buckets[buckets.length - 1];
  const rangeLabel = `${first.date} to ${last.date}, UTC`;

  return {
    buckets,
    rangeLabel,
    startDate: startDateUTC,
    endDate: todayUTC,
  };
}
