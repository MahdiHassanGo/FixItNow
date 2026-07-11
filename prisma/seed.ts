import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for seeding");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const seed = async () => {
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "ChangeMe123!", 12);
  const technicianPassword = await bcrypt.hash("Technician123!", 12);
  const customerPassword = await bcrypt.hash("Customer123!", 12);

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@fixitnow.local" },
    update: { activeStatus: "ACTIVE", role: Role.ADMIN },
    create: {
      name: process.env.ADMIN_NAME ?? "FixItNow Administrator",
      email: process.env.ADMIN_EMAIL ?? "admin@fixitnow.local",
      password: adminPassword,
      phone: "01700000000",
      location: "Dhaka",
      role: Role.ADMIN
    }
  });

  const categories = [
    { name: "Plumbing", description: "Leak repair, pipe installation, fittings and bathroom maintenance." },
    { name: "Electrical", description: "Wiring, switches, lighting, fans and electrical troubleshooting." },
    { name: "Cleaning", description: "Residential, office and deep-cleaning services." },
    { name: "Painting", description: "Interior and exterior painting and surface preparation." }
  ];

  for (const category of categories) {
    await prisma.category.upsert({ where: { name: category.name }, update: category, create: category });
  }

  const technician = await prisma.user.upsert({
    where: { email: "technician@fixitnow.local" },
    update: { activeStatus: "ACTIVE", role: Role.TECHNICIAN },
    create: {
      name: "Rahim Service Expert",
      email: "technician@fixitnow.local",
      password: technicianPassword,
      phone: "01800000000",
      location: "Dhaka",
      role: Role.TECHNICIAN
    }
  });

  const profile = await prisma.technicianProfile.upsert({
    where: { userId: technician.id },
    update: {
      bio: "Home-maintenance technician focused on plumbing and emergency repairs.",
      skills: ["Leak detection", "Pipe repair", "Bathroom fittings"],
      experienceYears: 5,
      pricePerHour: 1200,
      location: "Dhaka",
      ...({ timezone: "Asia/Dhaka" } as never)
    },
    create: {
      userId: technician.id,
      bio: "Home-maintenance technician focused on plumbing and emergency repairs.",
      skills: ["Leak detection", "Pipe repair", "Bathroom fittings"],
      experienceYears: 5,
      pricePerHour: 1200,
      location: "Dhaka"
    }
  });

  const plumbing = await prisma.category.findUniqueOrThrow({ where: { name: "Plumbing" } });
  await prisma.service.upsert({
    where: { id: "11111111-1111-4111-8111-111111111111" },
    update: {
      title: "Emergency Water Leak Repair",
      description: "Inspection and repair for urgent household pipe or fixture leaks.",
      price: 1500,
      location: "Dhaka",
      isActive: true,
      categoryId: plumbing.id,
      technicianId: profile.id
    },
    create: {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Emergency Water Leak Repair",
      description: "Inspection and repair for urgent household pipe or fixture leaks.",
      price: 1500,
      location: "Dhaka",
      categoryId: plumbing.id,
      technicianId: profile.id
    }
  });

  const availability = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"] as const;
  await prisma.availability.deleteMany({ where: { technicianId: profile.id } });
  await prisma.availability.createMany({
    data: availability.map((dayOfWeek) => ({
      technicianId: profile.id,
      dayOfWeek,
      startTime: "09:00",
      endTime: "18:00"
    }))
  });

  await prisma.user.upsert({
    where: { email: "customer@fixitnow.local" },
    update: { activeStatus: "ACTIVE", role: Role.CUSTOMER },
    create: {
      name: "Demo Customer",
      email: "customer@fixitnow.local",
      password: customerPassword,
      phone: "01900000000",
      location: "Dhaka",
      role: Role.CUSTOMER
    }
  });

  console.log("Seed completed");
};

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
