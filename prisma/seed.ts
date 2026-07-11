import bcrypt from "bcryptjs";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { Role } from "../generated/prisma/enums";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@fixitnow.com";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, activeStatus: "ACTIVE" },
    create: {
      name: "FixItNow Admin",
      email: adminEmail,
      password: hashedAdminPassword,
      role: Role.ADMIN,
      phone: "01700000000",
      location: "Dhaka"
    }
  });

  const categories = [
    { name: "Plumbing", description: "Pipe repair, leakage fix, sink and bathroom work" },
    { name: "Electrical", description: "Fan, light, switch, wiring and appliance support" },
    { name: "Cleaning", description: "Home, office and deep cleaning services" },
    { name: "Painting", description: "Interior and exterior painting services" }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category
    });
  }

  const technicianPassword = await bcrypt.hash("technician123", 12);
  const technicianUser = await prisma.user.upsert({
    where: { email: "technician@fixitnow.com" },
    update: { role: Role.TECHNICIAN, activeStatus: "ACTIVE" },
    create: {
      name: "Demo Technician",
      email: "technician@fixitnow.com",
      password: technicianPassword,
      role: Role.TECHNICIAN,
      phone: "01800000000",
      location: "Dhaka"
    }
  });

  const plumbing = await prisma.category.findUniqueOrThrow({ where: { name: "Plumbing" } });

  const profile = await prisma.technicianProfile.upsert({
    where: { userId: technicianUser.id },
    update: {
      bio: "Experienced home service technician",
      skills: ["Pipe repair", "Leakage fixing", "Bathroom fitting"],
      experienceYears: 3,
      pricePerHour: 20,
      location: "Dhaka"
    },
    create: {
      userId: technicianUser.id,
      bio: "Experienced home service technician",
      skills: ["Pipe repair", "Leakage fixing", "Bathroom fitting"],
      experienceYears: 3,
      pricePerHour: 20,
      location: "Dhaka"
    }
  });

  await prisma.service.upsert({
    where: { id: "11111111-1111-4111-8111-111111111111" },
    update: {
      title: "Emergency Pipe Leakage Repair",
      description: "Fast pipe leakage and bathroom plumbing support",
      price: 25,
      location: "Dhaka",
      isActive: true,
      categoryId: plumbing.id,
      technicianId: profile.id
    },
    create: {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Emergency Pipe Leakage Repair",
      description: "Fast pipe leakage and bathroom plumbing support",
      price: 25,
      location: "Dhaka",
      isActive: true,
      categoryId: plumbing.id,
      technicianId: profile.id
    }
  });

  const customerPassword = await bcrypt.hash("customer123", 12);
  await prisma.user.upsert({
    where: { email: "customer@fixitnow.com" },
    update: { role: Role.CUSTOMER, activeStatus: "ACTIVE" },
    create: {
      name: "Demo Customer",
      email: "customer@fixitnow.com",
      password: customerPassword,
      role: Role.CUSTOMER,
      phone: "01900000000",
      location: "Dhaka"
    }
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });