const db = require('./src/services/db');
const logger = require('./src/services/logger');

async function testGetThreads() {
    console.log("Testing getThreads...");

    try {
        // Test 1: Inbox (Default)
        console.log("\n--- Test 1: Inbox ---");
        const inboxThreads = await db.getThreads(5, 0, 'inbox', 'Inbox');
        console.log(`Inbox Threads: ${inboxThreads.length}`);
        if (inboxThreads.length > 0) {
            console.log("Sample:", inboxThreads[0].subject, "| Status:", inboxThreads[0].status, "| Channel:", inboxThreads[0].channel);
        }

        // Test 2: Specific Channel (e.g., 'Sales')
        console.log("\n--- Test 2: Channel 'Sales' ---");
        // Simulate what App.jsx sends: status='inbox', channel='Sales'
        const salesThreads = await db.getThreads(5, 0, 'inbox', 'Sales');
        console.log(`Sales Threads: ${salesThreads.length}`);
        if (salesThreads.length > 0) {
            console.log("Sample:", salesThreads[0].subject, "| Status:", salesThreads[0].status, "| Channel:", salesThreads[0].channel);
        } else {
            console.log("No threads found in Sales channel with status=inbox filter override.");

            // Debug: Check if ANY threads exist in Sales channel
            const allSales = await db.supabase.from('threads').select('*').eq('channel', 'Sales').limit(5);
            console.log(`DEBUG: Raw count in 'Sales' channel: ${allSales.data?.length}`);
            if (allSales.data?.length > 0) {
                console.log("DEBUG Sample:", allSales.data[0].subject, "| Status:", allSales.data[0].status);
            }
        }

    } catch (err) {
        console.error("Test failed:", err);
    }
}

testGetThreads();
