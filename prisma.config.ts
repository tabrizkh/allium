import dotenv from 'dotenv'
import path from 'path'

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '.env') })

export default {
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
}
