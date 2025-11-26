const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Nylas = require('nylas');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

// Initialize Nylas client
const nylasApiKey = process.env.NYLAS_API_KEY;
let nylas = null;
if (nylasApiKey) {
    nylas = new Nylas({
        apiKey: nylasApiKey,
    });
}


app.get('/ping', (req, res) => {
    res.send('pong');
});

app.get('/supabase', async (req, res) => {
    if (!supabase) {
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
        res.status(500).json({ error: error.message });
    }
});

app.get('/nylas', async (req, res) => {
    if (!nylas) {
        return res.status(500).json({ error: 'Nylas not configured' });
    }

    try {
        // List grants to find a valid one
        const grants = await nylas.grants.list();
        const firstGrant = grants.data[0];

        if (!firstGrant) {
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
        console.error("Nylas Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/nylas/thread/:id', async (req, res) => {
    try {
        const grants = await nylas.grants.list();
        const firstGrant = grants.data[0];
        if (!firstGrant) return res.status(401).json({ error: 'No grant found' });

        const messages = await nylas.messages.list({
            identifier: firstGrant.id,
            queryParams: {
                threadId: req.params.id,
                limit: 10
            }
        });

        res.json({ messages: messages.data });
    } catch (error) {
        console.error("Nylas Thread Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.use(express.json());

app.get('/opticutter', (req, res) => {
    const opticutterKey = process.env.OPTICUTTER_API_KEY;
    if (!opticutterKey) {
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
        const response = await fetch('https://api.opticutter.com/linear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${opticutterKey}`
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error("OptiCutter Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Serve static files from the React client
app.use(express.static(path.join(__dirname, '../client/dist')));

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
        console.error('Pricing Route Error:', error);
        res.status(500).json({ error: 'Failed to calculate price' });
    }
});

app.get('/version', (req, res) => {
    res.send('v2 - Refined Inbox UI');
});

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '../client/dist/index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error("Error sending index.html:", err);
            res.status(500).send("Error loading application: " + err.message);
        }
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
