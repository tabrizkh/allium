import fs from 'node:fs'
import path from 'node:path'

// Prisma 7 artiq .env faylini avtomatik oxumur, ona gore lokal dev-de
// buradan yuklenir. Qesden "dotenv" paketinden istifade edilmir:
// production Docker image-de yalniz global prisma CLI var ve dotenv
// tapilmadigi ucun config yuklenmesi cokur. Railway-de env deyisenler
// birbasa process.env-e verilir, .env fayli olmur.
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  }
}

export default {
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    // Prisma 7 package.json-dakі "prisma" sahesini oxumur, seed burada teyin olunur
    seed: 'tsx prisma/seed.ts',
  },
}
