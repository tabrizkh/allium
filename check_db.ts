
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const categories = await prisma.category.findMany({
    include: {
      packaging: true,
      products: true
    }
  });

  console.log(JSON.stringify(categories, null, 2));
}

check();
