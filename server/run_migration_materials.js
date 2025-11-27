const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Use connection string from env or fallback to the one found in run_sql.js (which seems to be the one used locally)
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:qvBQcsnluBjk92O8@db.lbderouteefxjkzufqkj.supabase.co:5432/postgres';
const sqlPath = path.join(__dirname, 'migration_create_materials.sql');

async function run() {
    console.log("Connecting to DB...");
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("Connected. Reading SQL file...");
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log("Executing SQL...");
        await client.query(sql);
        console.log("Migration executed successfully");
    } catch (err) {
        console.error("Error executing migration:", err);
    } finally {
        await client.end();
    }
}

run();
