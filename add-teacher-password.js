const { Client } = require("pg")

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_4XG6qVpIOcEs@ep-autumn-pond-aigfy3z5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
})

async function main() {
  await client.connect()
  console.log("Connected to database...")

  await client.query(`
    ALTER TABLE "Teacher" ADD COLUMN IF NOT EXISTS "password" TEXT;
  `)

  console.log("✅ Password column added to Teacher table!")
  await client.end()
}

main().catch(err => {
  console.error("Error:", err.message)
  process.exit(1)
})
