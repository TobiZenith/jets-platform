const { Client } = require('pg')

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_4XG6qVpIOcEs@ep-autumn-pond-aigfy3z5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
})

async function main() {
  await client.connect()
  console.log('Connected!')
  
  await client.query('ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS photo TEXT')
  console.log('Photo column added!')
  
  await client.end()
  console.log('Done!')
}

main().catch(console.error)

