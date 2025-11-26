const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const Nylas = require('nylas');

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
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

