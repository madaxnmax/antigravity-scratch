const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Nylas = require('nylas');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const logger = require('./src/services/logger');

const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});



// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    logger.info('Supabase client initialized');
} else {
    logger.warn('Supabase credentials missing');
}

// Initialize Nylas client
const nylasApiKey = process.env.NYLAS_API_KEY;
let nylas = null;
if (nylasApiKey) {
    nylas = new Nylas({
        apiKey: nylasApiKey,
    });
    logger.info('Nylas client initialized');
} else {
    logger.warn('Nylas credentials missing');
}


app.get('/ping', (req, res) => {
    res.send('pong');
});

app.get('/supabase', async (req, res) => {
    if (!supabase) {
        logger.error('Supabase not configured request failed');
        return res.status(500).json({ error: 'Supabase not configured' });
    }

    try {
        // Simple query to check connection - listing tables isn't direct in client, 
        // so we'll just check if we can access auth or a known table.
        // For now, just returning the URL to prove env vars are set (masked).
        res.json({
            status: 'Connected',
            url: supabaseUrl.replace(/^(https:\/\/)([^.]+)(.*)$/, '$1***$3')
        });
    } catch (error) {
        logger.error('Supabase connection check failed', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/nylas', async (req, res) => {
    if (!nylas) {
        logger.error('Nylas not configured request failed');
        return res.status(500).json({ error: 'Nylas not configured' });
    }

    try {
        // List grants to find a valid one
        const grants = await nylas.grants.list();
        const firstGrant = grants.data[0];

        if (!firstGrant) {
            logger.warn('No Nylas grants found');
            return res.json({ status: 'Connected', message: 'No grants found. Please authenticate a user.' });
        }

        // Fetch threads for the first grant
        const threads = await nylas.threads.list({
            identifier: firstGrant.id,
            queryParams: { limit: 10 }
        });

        res.json({
            status: 'Connected',
            user: firstGrant.email,
            threads: threads.data
        });
    } catch (error) {
        logger.error("Nylas Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/nylas/grants', async (req, res) => {
    if (!nylas) {
        return res.status(500).json({ error: 'Nylas not configured' });
    }
    try {
        const grants = await nylas.grants.list();
        logger.info(`Fetched ${grants.data.length} grants`, { grants: grants.data });
        res.json(grants.data);
    } catch (error) {
        logger.error("Nylas Grants Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/nylas/directory', async (req, res) => {
    try {
        const query = req.query.q || '';
        const grantId = req.query.grantId;

        if (!grantId) {
            return res.status(400).json({ error: 'Grant ID is required' });
        }

        // Search contacts in the organization domain and address book
        // Note: 'source: domain' might require specific scopes. We'll try both or fallback.
        // Nylas v3 might not support multiple sources in one request depending on the provider.
        // We'll try fetching from 'domain' first, if empty/fails, try 'address_book'.

        let contacts = [];
        try {
            const domainContacts = await nylas.contacts.list({
                identifier: grantId,
                queryParams: {
                    source: 'domain',
                    email: query
                }
            });
            contacts = [...contacts, ...domainContacts.data];
        } catch (err) {
            logger.warn(`Failed to fetch domain contacts for grant ${grantId}: ${err.message}`);
        }

        try {
            const addressBookContacts = await nylas.contacts.list({
                identifier: grantId,
                queryParams: {
                    source: 'address_book',
                    email: query
                }
            });
            contacts = [...contacts, ...addressBookContacts.data];
        } catch (err) {
            logger.warn(`Failed to fetch address_book contacts for grant ${grantId}: ${err.message}`);
        }

        // Deduplicate by email
        const uniqueContacts = Array.from(new Map(contacts.map(c => [c.email, c])).values());

        logger.info(`Fetched directory contacts for grant ${grantId}`, { count: uniqueContacts.length });
        res.json(uniqueContacts);
    } catch (error) {
        logger.error("Nylas Directory Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/nylas/send', async (req, res) => {
    try {
        const { grantId, to, cc, bcc, subject, body, replyToMessageId } = req.body;

        logger.info(`Received send request`, { grantId, to, subject, replyToMessageId });

        if (!grantId) return res.status(400).json({ error: 'Grant ID is required' });
        if (!to || !to.length) return res.status(400).json({ error: 'To recipient is required' });

        const draft = {
            subject,
            body,
            to: to.map(email => ({ email })),
            cc: cc && cc.length ? cc.map(email => ({ email })) : [],
            bcc: bcc && bcc.length ? bcc.map(email => ({ email })) : []
        };

        if (replyToMessageId) {
            draft.replyToMessageId = replyToMessageId;
        }

        logger.info(`Sending email via grant ${grantId}`, { draft });

        const sentMessage = await nylas.messages.send({
            identifier: grantId,
            requestBody: draft
        });

        logger.info(`Email sent successfully`, { id: sentMessage.data.id });
        res.json(sentMessage.data);
    } catch (error) {
        logger.error("Nylas Send Error:", error);
        res.status(500).json({ error: error.message, details: error.stack });
    }
});

app.get('/nylas/threads', async (req, res) => {
    if (!nylas) {
        logger.error('Nylas not configured request failed');
        return res.status(500).json({ error: 'Nylas not configured' });
    }
    try {
        const limit = req.query.limit || 10;
        const grants = await nylas.grants.list();

        if (!grants.data || grants.data.length === 0) {
            return res.json({ threads: [], userEmail: null });
        }

        const allThreads = [];
        const primaryEmail = grants.data[0].email;

        // Fetch threads for each grant
        for (const grant of grants.data) {
            try {
                const threads = await nylas.threads.list({
                    identifier: grant.id,
                    queryParams: { limit: parseInt(limit) }
                });

                // Attach grantId and accountEmail to each thread
                const threadsWithGrant = threads.data.map(t => ({
                    ...t,
                    grantId: grant.id,
                    accountEmail: grant.email
                }));

                allThreads.push(...threadsWithGrant);
            } catch (err) {
                logger.error(`Error fetching threads for grant ${grant.id}:`, err);
                // Continue to next grant even if one fails
            }
        }

        // Sort combined threads by last_message_timestamp (descending)
        allThreads.sort((a, b) => b.last_message_timestamp - a.last_message_timestamp);

        res.json({
            threads: allThreads,
            userEmail: primaryEmail // Default to first grant's email for "Me" identification
        });
    } catch (error) {
        logger.error("Nylas Threads Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/nylas/thread/:id', async (req, res) => {
    if (!nylas) {
        logger.error('Nylas not configured request failed');
        return res.status(500).json({ error: 'Nylas not configured' });
    }
    try {
        const grantId = req.query.grantId;
        let targetGrantId = grantId;

        if (!targetGrantId) {
            // Fallback to first grant if no grantId provided (backward compatibility)
            const grants = await nylas.grants.list();
            const firstGrant = grants.data[0];
            if (!firstGrant) return res.status(401).json({ error: 'No grant found' });
            targetGrantId = firstGrant.id;
        }

        const messages = await nylas.messages.list({
            identifier: targetGrantId,
            queryParams: {
                threadId: req.params.id,
                limit: 50 // Increased limit for full history
            }
        });

        res.json({ messages: messages.data });
    } catch (error) {
        logger.error("Nylas Thread Error:", error);
        res.status(500).json({ error: error.message });
    }
});


app.get('/opticutter', (req, res) => {
    const opticutterKey = process.env.OPTICUTTER_API_KEY;
    if (!opticutterKey) {
        logger.error('OptiCutter not configured request failed');
        return res.status(500).json({ error: 'OptiCutter not configured' });
    }
    res.json({ status: 'OptiCutter Configured', apiKeyPresent: true });
});

app.post('/opticutter/optimize', async (req, res) => {
    const opticutterKey = process.env.OPTICUTTER_API_KEY;
    if (!opticutterKey) {
        return res.status(500).json({ error: 'OptiCutter API key not configured' });
    }

    try {
        logger.info("Received OptiCutter optimization request", { payload: req.body });
        console.log("Proxying to OptiCutter...");
        console.log("Incoming Payload Body:", JSON.stringify(req.body, null, 2));

        const response = await fetch('https://api.opticutter.com/v1/panel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${opticutterKey}`
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        console.log("OptiCutter Response Status:", response.status);

        if (!response.ok) {
            console.error("OptiCutter Error Response:", JSON.stringify(data, null, 2));
            logger.error('OptiCutter API error', { status: response.status, data });
            return res.status(response.status).json(data);
        }

        logger.info("OptiCutter optimization successful", { result: data });
        res.json(data);
    } catch (error) {
        logger.error("OptiCutter Error:", error);
        res.status(500).json({ error: error.message });
    }
});


// Serve static files from the React client
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
    logger.info(`Serving static files from ${clientDistPath}`);
    app.use(express.static(clientDistPath));
} else {
    logger.error(`Client dist directory not found at ${clientDistPath}`);
}

// --- SUPABASE EMAIL ROUTES ---
const dbService = require('./src/services/db');
const syncService = require('./src/services/sync');

// Sync Endpoint
// Sync Endpoint
app.post('/api/sync', async (req, res) => {
    try {
        const grants = await nylas.grants.list();
        if (grants.data.length > 0) {
            // Sync ALL grants
            const results = await Promise.allSettled(grants.data.map(grant => syncService.syncThreads(grant.id)));
            const failed = results.filter(r => r.status === 'rejected');

            if (failed.length > 0) {
                logger.warn(`Sync partially failed. ${failed.length} grants failed.`);
            }

            res.json({ success: true, message: `Sync started for ${grants.data.length} accounts` });
        } else {
            res.status(400).json({ error: 'No connected accounts' });
        }
    } catch (error) {
        logger.error('Sync failed', error);
        res.status(500).json({ error: 'Sync failed' });
    }
});

// Audit Endpoint
app.get('/api/audit', async (req, res) => {
    try {
        const audit = {
            nylas: { status: 'unknown', threads: [] },
            supabase: { status: 'unknown', threads: [] },
            match: false
        };

        // 1. Check Nylas
        try {
            const grants = await nylas.grants.list();
            if (grants.data.length > 0) {
                const grantId = grants.data[0].id;
                const nylasRes = await nylas.threads.list({
                    identifier: grantId,
                    queryParams: { limit: 5 }
                });
                audit.nylas.status = 'connected';
                // Debug: Return raw first thread to check fields
                audit.nylas.raw_sample = nylasRes.data[0];

                audit.nylas.threads = nylasRes.data.map(t => {
                    const ts = t.latestMessageReceivedDate || t.date || 0; // Fix: Use correct field
                    return {
                        id: t.id,
                        subject: t.subject,
                        timestamp_raw: ts,
                        date: ts ? new Date(ts * 1000).toISOString() : 'Invalid Date'
                    };
                });
            } else {
                audit.nylas.status = 'no_grants';
            }
        } catch (e) {
            audit.nylas.status = 'error';
            audit.nylas.error = e.message;
        }

        // 2. Check Supabase
        try {
            const dbThreads = await dbService.getThreads(5);
            audit.supabase.status = 'connected';
            audit.supabase.threads = dbThreads.map(t => ({
                id: t.id,
                subject: t.subject,
                date: new Date(t.last_message_timestamp * 1000).toISOString()
            }));
        } catch (e) {
            audit.supabase.status = 'error';
            audit.supabase.error = e.message;
        }

        // 3. Compare (Check if top Nylas thread exists in Supabase)
        if (audit.nylas.threads.length > 0 && audit.supabase.threads.length > 0) {
            const topNylasId = audit.nylas.threads[0].id;
            const foundInDb = audit.supabase.threads.find(t => t.id === topNylasId);
            audit.match = !!foundInDb;
        }

        res.json(audit);
    } catch (error) {
        res.status(500).json({ error: 'Audit failed', details: error.message });
    }
});

// Get New Thread Count
app.get('/api/threads/count', async (req, res) => {
    try {
        const channel = req.query.channel || 'Inbox';
        const count = await dbService.getNewThreadCount(channel);
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch thread count' });
    }
});

// Get Threads from DB
app.get('/api/threads', async (req, res) => {
    try {
        const status = req.query.status; // Optional status filter
        const channel = req.query.channel; // Optional channel filter
        const threads = await dbService.getThreads(50, 0, status, channel);
        res.json(threads);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch threads' });
    }
});

// Update Thread (e.g. Archive or Mark as New/Read or Move Channel)
app.patch('/api/threads/:id', async (req, res) => {
    try {
        const { status, is_new, channel } = req.body;

        if (status) {
            await dbService.updateThreadStatus(req.params.id, status);
        }

        if (typeof is_new !== 'undefined') {
            await dbService.updateThreadIsNew(req.params.id, is_new);
        }

        if (channel) {
            await dbService.updateThreadChannel(req.params.id, channel);
        }

        res.json({ success: true });
    } catch (error) {
        logger.error('Failed to update thread', error);
        res.status(500).json({ error: 'Failed to update thread' });
    }
});

// Get Messages from DB
app.get('/api/threads/:id/messages', async (req, res) => {
    try {
        const messages = await dbService.getMessages(req.params.id);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// AI Route
const aiService = require('./src/services/ai');

app.post('/api/ai/parse-email', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const result = await aiService.parseEmail(content);
        res.json(result);
    } catch (error) {
        logger.error('Failed to parse email', error);
        res.status(500).json({ error: 'Failed to parse email' });
    }
});

// Pricing Route
const pricingService = require('./src/services/pricing');

app.post('/api/pricing/calculate', async (req, res) => {
    try {
        const { type, specs, quantity } = req.body;
        if (!type || !specs || !quantity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let result;
        if (type === 'Sheet') {
            result = await pricingService.calculateSheetPrice({
                grade: specs.grade,
                color: specs.color,
                thickness: specs.thickness,
                width: specs.width,
                length: specs.length,
                quantity: parseInt(quantity)
            });
        } else if (type === 'Rod') {
            result = await pricingService.calculateRodPrice({
                grade: specs.grade,
                color: specs.color,
                diameter: specs.diameter,
                length: specs.length,
                quantity: parseInt(quantity)
            });
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        if (result.error) {
            return res.status(404).json(result);
        }

        res.json(result);
    } catch (error) {
        logger.error('Pricing Route Error:', error);
        res.status(500).json({ error: 'Failed to calculate price' });
    }
});

app.get('/version', (req, res) => {
    res.send('v5.9 - Shared Inboxes');
});

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '../client/dist/index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        logger.error(`Index file not found at ${indexPath}`);
        res.status(500).send('Application build not found. Please check logs.');
    }
});

app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../client/dist/index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Not Found');
    }
});



// --- Teammates API ---
app.get('/api/teammates', async (req, res) => {
    try {
        const teammates = await dbService.getTeammates();
        res.json(teammates);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teammates' });
    }
});

app.post('/api/teammates', async (req, res) => {
    try {
        const teammate = await dbService.createTeammate(req.body);
        res.json(teammate);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create teammate' });
    }
});

// --- QUOTES ---
app.post('/api/quotes', async (req, res) => {
    try {
        const { threadId, cart, total, customer } = req.body;

        if (!threadId || !cart) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const quoteId = `quote_${Date.now()}`;
        const quoteData = {
            id: quoteId,
            cart,
            total,
            customer,
            createdAt: new Date().toISOString()
        };

        // Store as a special message
        const message = {
            id: crypto.randomUUID(),
            thread_id: threadId,
            subject: `Quote #${quoteId} Generated`,
            body: `[QUOTE_DATA]${JSON.stringify(quoteData)}[/QUOTE_DATA]`,
            from: [{ name: 'System', email: 'system@metalflow.app' }],
            to: [],
            cc: [],
            date: Math.floor(Date.now() / 1000)
        };

        await dbService.upsertMessage(message);

        // Update thread timestamp so it bumps to top
        await dbService.upsertThread({
            id: threadId,
            last_message_timestamp: message.date,
            snippet: `Quote #${quoteId} Generated`
        });

        res.json({ success: true, quoteId });
    } catch (error) {
        logger.error("Failed to save quote:", error);
        res.status(500).json({ error: 'Failed to save quote' });
    }
});

// --- Tags API ---
app.get('/api/tags', async (req, res) => {
    try {
        const tags = await dbService.getTags();
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

app.post('/api/tags', async (req, res) => {
    try {
        const tag = await dbService.createTag(req.body);
        res.json(tag);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create tag' });
    }
});

app.patch('/api/tags/:id', async (req, res) => {
    try {
        const tag = await dbService.updateTag(req.params.id, req.body);
        res.json(tag);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update tag' });
    }
});

app.delete('/api/tags/:id', async (req, res) => {
    try {
        await dbService.deleteTag(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete tag' });
    }
});

// Start Server
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info("Server starting with admin routes enabled (v2)");
});
