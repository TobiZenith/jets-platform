const { Client } = require("pg");
const c = new Client({ connectionString: "postgresql://neondb_owner:npg_4XG6qVpIOcEs@ep-autumn-pond-aigfy3z5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" });
c.connect().then(() => c.query(`
  CREATE TABLE IF NOT EXISTS "Subject" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "classId" TEXT NOT NULL REFERENCES "Class"(id) ON DELETE CASCADE,
    "schoolId" TEXT NOT NULL REFERENCES "School"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW()
  )
`)).then(() => { console.log("Subjects table created!"); c.end(); }).catch(e => { console.error(e.message); c.end(); })
