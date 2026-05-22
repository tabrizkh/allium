import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
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

  // Create Slider Items
  const sliderItemsData = [
    {
      title: "Букеты недели",
      subtitle: "Нежные композиции со скидкой",
      description: "Самые популярные букеты недели — идеальны для свидания, дня рождения или просто так, без повода.",
      imageUrl: "/bukets.webp",
      buttonText: "Смотреть каталог",
      buttonLink: "/#catalog",
      order: 1,
    },
    {
      title: "Вазы и декоры",
      subtitle: "Минимализм и стиль",
      description: "Стекло, керамика и фактурные формы — чтобы букет выглядел ещё эффектнее и жил дольше дома.",
      imageUrl: "/vase.webp",
      buttonText: "Смотреть каталог",
      buttonLink: "/#catalog",
      order: 2,
    },
    {
      title: "Подарочные наборы",
      subtitle: "Удобно и красиво",
      description: "Добавьте к букету подарок: сладости, открытку или милые детали — чтобы впечатление было ещё сильнее.",
      imageUrl: "/podarok.webp",
      buttonText: "Смотреть каталог",
      buttonLink: "/#catalog",
      order: 3,
    },
  ];

  for (const item of sliderItemsData) {
    const existing = await prisma.sliderItem.findFirst({
      where: { title: item.title }
    });
    if (!existing) {
      await prisma.sliderItem.create({
        data: item
      });
    }
  }
  console.log("Slider items seeded");

  // Create Products
  const bouquetsCat = await prisma.category.findUnique({ where: { slug: "bouquets" } });
  const giftsCat = await prisma.category.findUnique({ where: { slug: "gifts" } });

  const productsData = [
    {
      name: "Роскошный букет роз",
      slug: "luxurious-rose-bouquet",
      description: "101 красная роза",
      price: 15000,
      categoryId: bouquetsCat?.id,
      images: JSON.stringify(["/bukets.webp"]),
      recipients: JSON.stringify(["wife", "mom"]),
      occasions: JSON.stringify(["birthday", "wedding"]),
      isPopular: true,
    },
    {
      name: "Весенний микс",
      slug: "spring-mix",
      description: "Тюльпаны и ирисы",
      price: 5000,
      categoryId: bouquetsCat?.id,
      images: JSON.stringify(["/6.webp"]),
      recipients: JSON.stringify(["mom", "colleague", "friend"]),
      occasions: JSON.stringify(["holiday", "gift"]),
      isPopular: true,
    },
    {
      name: "Подарочный набор 'Сладкий'",
      slug: "sweet-gift-set",
      description: "Шоколад и цветы",
      price: 3500,
      categoryId: giftsCat?.id,
      images: JSON.stringify(["/podarok.webp"]),
      recipients: JSON.stringify(["children", "friend"]),
      occasions: JSON.stringify(["birthday", "gift"]),
      isPopular: false,
    },
    {
      name: "Букет 'Нежность'",
      slug: "tenderness-bouquet",
      description: "Розовые пионы и эустома",
      price: 6500,
      categoryId: bouquetsCat?.id,
      images: JSON.stringify(["/1.jpg"]),
      recipients: JSON.stringify(["wife", "mom"]),
      occasions: JSON.stringify(["birthday", "holiday"]),
      isPopular: true,
      isTrending: true,
    },
    {
      name: "Лавандовое небо",
      slug: "lavender-sky",
      description: "Лаванда и белые розы",
      price: 4500,
      categoryId: bouquetsCat?.id,
      images: JSON.stringify(["/2.jpeg"]),
      recipients: JSON.stringify(["friend", "colleague"]),
      occasions: JSON.stringify(["gift", "holiday"]),
      isPopular: false,
      isTrending: true,
    },
    {
      name: "Солнечный день",
      slug: "sunny-day",
      description: "Подсолнухи и герберы",
      price: 3800,
      categoryId: bouquetsCat?.id,
      images: JSON.stringify(["/3.jpg"]),
      recipients: JSON.stringify(["friend", "children"]),
      occasions: JSON.stringify(["birthday", "gift"]),
      isPopular: false,
      isTrending: true,
    },
  ];

  for (const p of productsData) {
    if (p.categoryId) {
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: p as any,
      });
    }
  }

  console.log("Products seeded");

  // Create Packaging for Categories
  const packagingData = [
    {
      name: "Крафт-бумага",
      price: 5,
      image: null,
      isAvailable: true,
      categoryId: bouquetsCat?.id,
    },
    {
      name: "Премиум упаковка",
      price: 15,
      image: null,
      isAvailable: true,
      categoryId: bouquetsCat?.id,
    },
    {
      name: "Подарочная коробка",
      price: 10,
      image: null,
      isAvailable: true,
      categoryId: giftsCat?.id,
    },
  ];

  for (const pkg of packagingData) {
    if (pkg.categoryId) {
      await prisma.packaging.upsert({
        where: { id: `seed-${pkg.name}-${pkg.categoryId}` }, // Using a stable ID for upsert
        update: {},
        create: {
          name: pkg.name,
          price: pkg.price,
          image: pkg.image,
          isAvailable: pkg.isAvailable,
          categoryId: pkg.categoryId,
          id: `seed-${pkg.name}-${pkg.categoryId}`
        },
      });
    }
  }
  console.log("Packaging seeded");
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
