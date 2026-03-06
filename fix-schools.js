const { Client } = require('pg')

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_4XG6qVpIOcEs@ep-autumn-pond-aigfy3z5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
})

async function main() {
  await client.connect()
  console.log('Connected!')
  
  // Drop unique constraint temporarily
  await client.query('ALTER TABLE "School" DROP CONSTRAINT IF EXISTS "School_code_key"')
  console.log('Constraint dropped!')
  
  // Update each school with unique codes
  await client.query("UPDATE \"School\" SET code = 'JETS-ZZZ999' WHERE id = 'cmmalqzl200008cub9fovayft'")
  await client.query("UPDATE \"School\" SET code = 'JETS-LKB001' WHERE id = 'cmmcabx8v000004jr8yvhrxbn'")
  await client.query("UPDATE \"School\" SET code = 'JETS-WAC001' WHERE id = 'cmmcc0g95000004kyw8ivd90u'")
  await client.query("UPDATE \"School\" SET code = 'JETS-PAJ001' WHERE id = 'cmmalufss00028cub3k7z4ir4'")
  console.log('Codes updated!')
  
  // Add unique constraint back
  await client.query('ALTER TABLE "School" ADD CONSTRAINT "School_code_key" UNIQUE (code)')
  console.log('Constraint added back!')
  
  const result = await client.query('SELECT id, name, code FROM "School"')
  console.log('Updated schools:', result.rows)
  
  await client.end()
}

main().catch(console.error)
