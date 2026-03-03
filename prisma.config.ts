import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrate: {
    async adapter() {
      const { PrismaNeon } = await import("@prisma/adapter-neon")
      const connectionString = process.env.DATABASE_URL!
      return new PrismaNeon({ connectionString })
    }
  }
})