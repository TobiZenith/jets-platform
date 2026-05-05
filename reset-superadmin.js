const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const c = new Client({ 
  connectionString: 'postgresql://neondb_owner:npg_4XG6qVpIOcEs@ep-autumn-pond-aigfy3z5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require' 
});

c.connect().then(async () => {
  const hash = await bcrypt.hash('superadmin123', 10);
  const result = await c.query(
    'UPDATE "User" SET password = $1, role = $2 WHERE email = $3 RETURNING email, role',
    [hash, 'superadmin', 'superadmin@jets.com']
  );
  console.log('Updated rows:', result.rowCount);
  console.log('User:', result.rows);
  
  // Also verify the user exists
  const check = await c.query('SELECT id, email, role FROM "User" WHERE email = $1', ['superadmin@jets.com']);
  console.log('Current user:', check.rows);
  c.end();
}).catch(e => { console.error('Error:', e.message); c.end(); });