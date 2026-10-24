import { PrismaClient, Role } from "@prisma/client";

// Ensure .env.local is loaded in standalone execution
if (!process.env.DATABASE_URL && typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Ignore if not found
  }
}

const prisma = new PrismaClient();

async function seed() {
  // Refuse if NODE_ENV is production
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to seed: NODE_ENV is production. Seeding is strictly forbidden in production.");
    process.exit(1);
  }

  // Validate dev marker if specified in environment
  const devMarker = process.env.SEED_DEV_MARKER;
  const dbUrl = process.env.DATABASE_URL || "";

  if (devMarker && !dbUrl.includes(devMarker)) {
    console.error(
      `Refusing to seed: DATABASE_URL does not contain the required dev marker "${devMarker}". Seeding is restricted to development databases.`
    );
    process.exit(1);
  }

  console.log("Seeding 15 test users into development database...");

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // 15 test users with test+01@example.com ... test+15@example.com
  const testUsersData = [
    { num: 1, name: "Alice Adams", role: Role.USER, daysAgoCreated: 28, hasSignedIn: true, daysAgoSigned: 2 },
    { num: 2, name: "Bob Baker", role: Role.USER, daysAgoCreated: 25, hasSignedIn: true, daysAgoSigned: 5 },
    { num: 3, name: "Charlie Clark", role: Role.ADMIN, daysAgoCreated: 24, hasSignedIn: true, daysAgoSigned: 1 },
    { num: 4, name: "Diana Davis", role: Role.USER, daysAgoCreated: 20, hasSignedIn: false, daysAgoSigned: 0 },
    { num: 5, name: "Evan Evans", role: Role.USER, daysAgoCreated: 18, hasSignedIn: true, daysAgoSigned: 12 },
    { num: 6, name: "Fiona Foster", role: Role.USER, daysAgoCreated: 15, hasSignedIn: true, daysAgoSigned: 0.5 },
    { num: 7, name: "George Green", role: Role.USER, daysAgoCreated: 14, hasSignedIn: false, daysAgoSigned: 0 },
    { num: 8, name: "Hannah Hall", role: Role.USER, daysAgoCreated: 10, hasSignedIn: true, daysAgoSigned: 8 },
    { num: 9, name: "Ian Irving", role: Role.USER, daysAgoCreated: 7, hasSignedIn: true, daysAgoSigned: 0.2 },
    { num: 10, name: "Julia Jones", role: Role.USER, daysAgoCreated: 6, hasSignedIn: false, daysAgoSigned: 0 },
    { num: 11, name: "Kevin King", role: Role.USER, daysAgoCreated: 5, hasSignedIn: true, daysAgoSigned: 3 },
    { num: 12, name: "Laura Lee", role: Role.USER, daysAgoCreated: 4, hasSignedIn: true, daysAgoSigned: 0.1 },
    { num: 13, name: "Mike Miller", role: Role.USER, daysAgoCreated: 3, hasSignedIn: false, daysAgoSigned: 0 },
    { num: 14, name: "Nina Nelson", role: Role.USER, daysAgoCreated: 2, hasSignedIn: true, daysAgoSigned: 1.5 },
    { num: 15, name: "Oscar Owens", role: Role.USER, daysAgoCreated: 1, hasSignedIn: true, daysAgoSigned: 0.05 },
  ];

  for (const item of testUsersData) {
    const pad = item.num < 10 ? `0${item.num}` : `${item.num}`;
    const email = `test+${pad}@example.com`;
    const createdAt = new Date(now - item.daysAgoCreated * dayMs);
    const lastSignedInAt = item.hasSignedIn
      ? new Date(now - item.daysAgoSigned * dayMs)
      : null;

    await prisma.user.upsert({
      where: { email },
      update: {
        name: item.name,
        role: item.role,
        status: "ACTIVE",
        lastSignedInAt,
      },
      create: {
        email,
        name: item.name,
        role: item.role,
        status: "ACTIVE",
        createdAt,
        lastSignedInAt,
      },
    });
  }

  console.log("Successfully seeded 15 test users.");
}

seed()
  .catch((err) => {
    console.error("Error running seed script:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
