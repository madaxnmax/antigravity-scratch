const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is not defined in .env");
    process.exit(1);
}

const sqlFile = process.argv[2];
if (!sqlFile) {
    console.error("Usage: node run_sql.js <path_to_sql_file>");
    process.exit(1);
}

const sqlPath = path.resolve(process.cwd(), sqlFile);

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
