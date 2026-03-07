const { Client } = require('pg')
const bcrypt = require('bcryptjs')

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_4XG6qVpIOcEs@ep-autumn-pond-aigfy3z5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
})

async function main() {
  await client.connect()
  console.log('Connected!')

  const hashedPassword = await bcrypt.hash('superadmin123', 10)

  try {
    const result = await client.query(
      `INSERT INTO "User" (id, "firstName", "lastName", email, password, role, "createdAt", "schoolId")
       VALUES (gen_random_uuid()::text, 'Super', 'Admin', 'superadmin@jets.com', $1, 'superadmin', NOW(), NULL)
       ON CONFLICT (email) DO UPDATE SET role = 'superadmin', password = $1`,
      [hashedPassword]
    )
    console.log('Superadmin created! Rows affected:', result.rowCount)
    console.log('Email: superadmin@jets.com')
    console.log('Password: superadmin123')
  } catch (err) {
    console.error('Query error:', err.message)
  }

  await client.end()
  console.log('Done!')
}

main().catch(console.error)

