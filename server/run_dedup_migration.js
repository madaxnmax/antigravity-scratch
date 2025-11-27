require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;
const sqlPath = path.join(__dirname, 'migration_add_deduplication_fields.sql');

async function run() {
    if (!connectionString) {
        console.error("DATABASE_URL is not set in .env");
        return;
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase pooler usually
    });

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
