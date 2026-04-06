/**
 * Admin User Seeding Script
 * 
 * Usage: npx ts-node prisma/seed-admin.ts
 * 
 * Environment variables required:
 * - DATABASE_URL: PostgreSQL connection string
 * - ADMIN_EMAIL: Admin user email (default: admin@tuitionmedia.com)
 * - ADMIN_PASSWORD: Admin password (default: prompts for input)
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as readline from "readline";

const prisma = new PrismaClient();

async function promptPassword(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Enter admin password: ", (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@tuitionmedia.com";
  let password = process.env.ADMIN_PASSWORD;

  if (!password) {
    password = await promptPassword();
  }

  if (!password || password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`User ${email} already exists with role: ${existing.role}`);
    if (existing.role !== "ADMIN") {
      await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
      console.log(`Updated ${email} to ADMIN role`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      name: "Admin",
      password_hash: passwordHash,
      role: "ADMIN",
      is_verified: true,
      is_active: true,
      updated_at: new Date(),
    },
  });

  console.log(`Created admin user: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error("Error creating admin user:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
