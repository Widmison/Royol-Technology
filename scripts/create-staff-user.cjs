/**
 * One-off: create or reset a STAFF user (email + password only; no email OTP in app).
 *
 * Usage:
 *   node --env-file=.env scripts/create-staff-user.cjs
 *   STAFF_SEED_EMAIL=ops@example.com STAFF_SEED_PASSWORD='YourPassword' node --env-file=.env scripts/create-staff-user.cjs
 *
 * If STAFF_SEED_PASSWORD is omitted, a random one-time password is generated and printed.
 */
const { PrismaClient, Role, AdminStaffRole } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

function createPool() {
  const connectionString = (process.env.DIRECT_URL || process.env.DATABASE_URL || "").trim();
  if (!connectionString) {
    throw new Error("Set DATABASE_URL (and ideally DIRECT_URL) in .env");
  }
  const hostish = connectionString.toLowerCase();
  const needsSsl =
    hostish.includes("supabase.co") ||
    hostish.includes("neon.tech") ||
    hostish.includes("amazonaws.com") ||
    hostish.includes("sslmode=require") ||
    hostish.includes("ssl=true");
  return new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 20_000,
    allowExitOnIdle: true,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

async function main() {
  const email = (process.env.STAFF_SEED_EMAIL || "staff@mex509.com").trim().toLowerCase();
  let password = process.env.STAFF_SEED_PASSWORD;
  if (!password) {
    password = "STAFF-" + crypto.randomBytes(12).toString("base64url");
    process.stdout.write(
      "\n[create-staff-user] No STAFF_SEED_PASSWORD set. Generated password (copy now):\n\n" +
        password +
        "\n\n"
    );
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const pool = createPool();
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const hash = await bcrypt.hash(password, 12);
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      if (existing.role === "CLIENT") {
        console.error("Refusing: " + email + " is a CLIENT. Use a different email.");
        process.exit(1);
      }
      if (existing.role === "ADMIN") {
        console.error("Refusing: " + email + " is an ADMIN. Use a different email or change role in the database.");
        process.exit(1);
      }
      if (existing.role === "STAFF") {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            password: hash,
            adminProfileComplete: true,
            adminStaffRole: AdminStaffRole.ADMIN_TEAM,
          },
        });
        console.log("Updated STAFF user " + email + " (password and profile flags refreshed).");
        return;
      }
    }

    await prisma.user.create({
      data: {
        email,
        password: hash,
        role: Role.STAFF,
        isVerified: true,
        firstName: "Staff",
        lastName: "User",
        adminProfileComplete: true,
        adminStaffRole: AdminStaffRole.ADMIN_TEAM,
      },
    });
    console.log("Created STAFF user " + email);
    console.log("Sign in at /admin/login with that email and password (no email OTP, no 2FA).");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
