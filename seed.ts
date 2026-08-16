import { PrismaClient, ServiceCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "shandellv.08@gmail.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "PalmsAruba2026!";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Palms in Aruba Owner",
      email: adminEmail,
      passwordHash,
      role: "OWNER",
    },
  });

  const services: {
    name: string;
    description: string;
    category: ServiceCategory;
    startingPrice: number;
    estimatedDuration: number;
    laborMinutes: number;
    materialCost: number;
    travelCost: number;
  }[] = [
    {
      name: "Basic Wash & Vacuum",
      description: "Regular cleaning for customers who maintain their vehicle regularly.",
      category: "BASIC",
      startingPrice: 60,
      estimatedDuration: 60,
      laborMinutes: 45,
      materialCost: 8,
      travelCost: 10,
    },
    {
      name: "Standard Interior & Exterior Detail",
      description: "More thorough interior and exterior detailing.",
      category: "STANDARD",
      startingPrice: 120,
      estimatedDuration: 120,
      laborMinutes: 90,
      materialCost: 15,
      travelCost: 10,
    },
    {
      name: "Premium Full Detail",
      description: "Deep detailing for heavily soiled or neglected vehicles.",
      category: "PREMIUM",
      startingPrice: 220,
      estimatedDuration: 210,
      laborMinutes: 160,
      materialCost: 30,
      travelCost: 10,
    },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) await prisma.service.create({ data: s });
  }

  const addOns = [
    { name: "Pet Hair Removal", price: 25, materialCost: 2 },
    { name: "Deep Stain Treatment", price: 30, materialCost: 4 },
    { name: "Interior Extraction", price: 40, materialCost: 6 },
    { name: "Odor Treatment", price: 20, materialCost: 3 },
    { name: "Headlight Restoration", price: 35, materialCost: 5 },
    { name: "Paint Enhancement", price: 60, materialCost: 10 },
    { name: "Wax / Sealant", price: 45, materialCost: 8 },
    { name: "Engine Bay Cleaning", price: 30, materialCost: 4 },
    { name: "Extra-Large Vehicle Surcharge", price: 25, materialCost: 0 },
    { name: "Excessive Dirt Surcharge", price: 20, materialCost: 0 },
  ];

  for (const a of addOns) {
    const existing = await prisma.addOn.findFirst({ where: { name: a.name } });
    if (!existing) await prisma.addOn.create({ data: a });
  }

  await prisma.businessSetting.upsert({
    where: { key: "labor_rate_per_hour" },
    update: {},
    create: { key: "labor_rate_per_hour", value: "20" },
  });
  await prisma.businessSetting.upsert({
    where: { key: "default_travel_cost" },
    update: {},
    create: { key: "default_travel_cost", value: "10" },
  });
  await prisma.businessSetting.upsert({
    where: { key: "currency" },
    update: {},
    create: { key: "currency", value: "AWG" },
  });
  await prisma.businessSetting.upsert({
    where: { key: "whatsapp_number" },
    update: {},
    create: { key: "whatsapp_number", value: "+297 000 0000" },
  });
  await prisma.businessSetting.upsert({
    where: { key: "service_area" },
    update: {},
    create: { key: "service_area", value: "Oranjestad, Noord, Palm Beach, Eagle Beach, San Nicolas" },
  });

  const decemberTarget = await prisma.kpiTarget.findFirst({
    where: { label: "December 2026" },
  });
  if (!decemberTarget) {
    await prisma.kpiTarget.create({
      data: {
        label: "December 2026",
        periodStart: new Date("2026-12-01"),
        periodEnd: new Date("2026-12-31"),
        targetCustomers: 40,
        targetAverageTicket: 125,
        targetRevenue: 5000,
        targetExpenses: 1500,
        targetProfit: 3500,
        targetRepeatCustomers: 15,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
