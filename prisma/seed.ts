import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Start seeding...");

  // Tạo tài khoản ADMIN mặc định
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@garden.com" },
    update: {},
    create: {
      email: "admin@garden.com",
      passwordHash: adminPassword,
      fullName: "System Admin",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin account ensured:", admin.email);

  // Tạo thêm một tài khoản FARMER mẫu để test nếu muốn
  const farmerPassword = await bcrypt.hash("Farmer@123", 10);
  const farmer = await prisma.user.upsert({
    where: { email: "farmer@garden.com" },
    update: {},
    create: {
      email: "farmer@garden.com",
      passwordHash: farmerPassword,
      fullName: "Master Farmer",
      role: "FARMER",
    },
  });
  console.log("✅ Farmer account ensured:", farmer.email);

  console.log("🎉 Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });