const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres:qvBQcsnluBjk92O8@db.lbderouteefxjkzufqkj.supabase.co:5432/postgres';
const sqlPath = '/Users/maxegan/.gemini/antigravity/brain/83fe4ffe-d82d-4dbf-9f36-5cef3ec87b0f/supabase_schema.sql';

async function run() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("Connected to DB");
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await client.query(sql);
        console.log("Schema executed successfully");
    } catch (err) {
        console.error("Error executing schema:", err);
    } finally {
        await client.end();
    }
}

run();
