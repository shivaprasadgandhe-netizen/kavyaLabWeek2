import { describe, it, expect } from "vitest";
import { buildDateBuckets } from "@/lib/admin/date-buckets";

describe("buildDateBuckets", () => {
  it("builds an array with exactly 30 points", () => {
    const fixedNow = new Date("2026-03-15T14:30:00Z");
    const result = buildDateBuckets([], fixedNow);
    expect(result.buckets).toHaveLength(30);
  });

  it("includes zero-signup days with count 0 when no signups occurred", () => {
    const fixedNow = new Date("2026-03-15T14:30:00Z");
    const rawData = [
      { day: new Date("2026-03-15T00:00:00Z"), count: 5 },
      { day: new Date("2026-03-10T00:00:00Z"), count: 3 },
    ];
    const result = buildDateBuckets(rawData, fixedNow);

    expect(result.buckets).toHaveLength(30);
    // Find the day with 5 signups
    const todayBucket = result.buckets.find((b) => b.isoDate === "2026-03-15");
    expect(todayBucket?.count).toBe(5);

    // Find the day with 3 signups
    const march10Bucket = result.buckets.find((b) => b.isoDate === "2026-03-10");
    expect(march10Bucket?.count).toBe(3);

    // A day with zero signups should be present with count 0
    const march14Bucket = result.buckets.find((b) => b.isoDate === "2026-03-14");
    expect(march14Bucket).toBeDefined();
    expect(march14Bucket?.count).toBe(0);
  });

  it("orders points chronologically from oldest to newest", () => {
    const fixedNow = new Date("2026-03-15T10:00:00Z");
    const result = buildDateBuckets([], fixedNow);

    for (let i = 0; i < result.buckets.length - 1; i++) {
      const current = new Date(result.buckets[i].isoDate).getTime();
      const next = new Date(result.buckets[i + 1].isoDate).getTime();
      expect(current).toBeLessThan(next);
    }

    // First element should be 29 days before fixedNow in UTC
    expect(result.buckets[0].isoDate).toBe("2026-02-14");
    // Last element should be today's date in UTC
    expect(result.buckets[29].isoDate).toBe("2026-03-15");
  });

  it("strictly respects UTC boundaries at midnight", () => {
    // 23:59 UTC vs 00:01 UTC next day
    const lateNightUTC = new Date("2026-05-10T23:59:59.999Z");
    const earlyMorningUTC = new Date("2026-05-11T00:00:01.000Z");

    const rawData = [
      { day: lateNightUTC, count: 2 },
      { day: earlyMorningUTC, count: 4 },
    ];

    const result = buildDateBuckets(rawData, earlyMorningUTC);

    const bucketMay10 = result.buckets.find((b) => b.isoDate === "2026-05-10");
    const bucketMay11 = result.buckets.find((b) => b.isoDate === "2026-05-11");

    expect(bucketMay10?.count).toBe(2);
    expect(bucketMay11?.count).toBe(4);

    // Verify startDate and endDate are aligned to UTC midnight
    expect(result.startDate.getUTCHours()).toBe(0);
    expect(result.startDate.getUTCMinutes()).toBe(0);
    expect(result.startDate.getUTCSeconds()).toBe(0);
    expect(result.endDate.getUTCHours()).toBe(0);
  });
});
