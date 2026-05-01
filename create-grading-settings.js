const { Client } = require("pg");
const c = new Client({ 
  connectionString: "postgresql://neondb_owner:npg_4XG6qVpIOcEs@ep-autumn-pond-aigfy3z5-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" 
});

const defaultBoundaries = JSON.stringify([
  { grade: "A", min: 70, max: 100, remark: "Excellent" },
  { grade: "B", min: 60, max: 69, remark: "Very Good" },
  { grade: "C", min: 50, max: 59, remark: "Good" },
  { grade: "D", min: 40, max: 49, remark: "Pass" },
  { grade: "F", min: 0, max: 39, remark: "Fail" }
]);

c.connect()
  .then(() => c.query(`
    CREATE TABLE IF NOT EXISTS "GradingSettings" (
      id TEXT PRIMARY KEY,
      "schoolId" TEXT NOT NULL UNIQUE,
      "caWeight" INTEGER NOT NULL DEFAULT 40,
      "examWeight" INTEGER NOT NULL DEFAULT 60,
      boundaries JSONB NOT NULL DEFAULT '[]'::jsonb,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `))
  .then(() => c.query(`
    ALTER TABLE "Grade" 
    ADD COLUMN IF NOT EXISTS "caScore" FLOAT,
    ADD COLUMN IF NOT EXISTS "examScore" FLOAT,
    ADD COLUMN IF NOT EXISTS "total" FLOAT,
    ADD COLUMN IF NOT EXISTS "gradeLetter" TEXT,
    ADD COLUMN IF NOT EXISTS "remark" TEXT,
    ADD COLUMN IF NOT EXISTS "published" BOOLEAN DEFAULT FALSE
  `))
  .then(() => { console.log("Done!"); c.end(); })
  .catch(e => { console.error(e.message); c.end(); });