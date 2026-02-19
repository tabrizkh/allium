import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@example.com";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log({ user });

  // Create Categories
  const categoriesData = [
    { name: "Букеты", slug: "bouquets", image: "/bukets.webp" },
    { name: "Подарки", slug: "gifts", image: "/podarok.webp" },
    { name: "Декор", slug: "decorations", image: "/dekor.jpg" },
    { name: "Вазы", slug: "vases", image: "/vase.webp" },
    { name: "Цветы", slug: "flowers", image: "/6.webp" },
    { name: "Сеты", slug: "sets", image: "/sets.jpg" },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Categories seeded");

  // Create Products
  const bouquetsCat = await prisma.category.findUnique({ where: { slug: "bouquets" } });
  const giftsCat = await prisma.category.findUnique({ where: { slug: "gifts" } });

  if (bouquetsCat) {
    await prisma.product.create({
      data: {
        name: "Роскошный букет роз",
        slug: "luxurious-rose-bouquet",
        description: "101 красная роза",
        price: 15000,
        categoryId: bouquetsCat.id,
        images: JSON.stringify(["/bukets.webp"]),
        recipients: JSON.stringify(["wife", "mom"]),
        occasions: JSON.stringify(["birthday", "wedding"]),
        isPopular: true,
      },
    });
    
    await prisma.product.create({
      data: {
        name: "Весенний микс",
        slug: "spring-mix",
        description: "Тюльпаны и ирисы",
        price: 5000,
        categoryId: bouquetsCat.id,
        images: JSON.stringify(["/6.webp"]),
        recipients: JSON.stringify(["mom", "colleague", "friend"]),
        occasions: JSON.stringify(["holiday", "gift"]),
        isPopular: true,
      },
    });
  }

  if (giftsCat) {
    await prisma.product.create({
      data: {
        name: "Подарочный набор 'Сладкий'",
        slug: "sweet-gift-set",
        description: "Шоколад и цветы",
        price: 3500,
        categoryId: giftsCat.id,
        images: JSON.stringify(["/podarok.webp"]),
        recipients: JSON.stringify(["children", "friend"]),
        occasions: JSON.stringify(["birthday", "gift"]),
        isPopular: false,
      },
    });
  }

  console.log("Products seeded");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
