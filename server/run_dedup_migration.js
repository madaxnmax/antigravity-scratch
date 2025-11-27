const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:VVGefPLMT6NpIJmT@db.lbderouteefxjkzufqkj.supabase.co:5432/postgres?sslmode=require';
const sqlPath = path.join(__dirname, 'migration_add_deduplication_fields.sql');

async function run() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("Connected to DB");
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await client.query(sql);
        console.log("Migration executed successfully");
    } catch (err) {
        console.error("Error executing migration:", err);
    } finally {
        await client.end();
    }
}

run();
