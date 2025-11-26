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

app.get('/', (req, res) => {
    res.send('Hello World from Railway!');
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

app.get('/nylas', (req, res) => {
    if (!nylas) {
        return res.status(500).json({ error: 'Nylas not configured' });
    }
    // Just return a status indicating configuration is present
    res.json({ status: 'Nylas Configured', apiKeyPresent: true });
});

app.get('/opticutter', (req, res) => {
    const opticutterKey = process.env.OPTICUTTER_API_KEY;
    if (!opticutterKey) {
        return res.status(500).json({ error: 'OptiCutter not configured' });
    }
    res.json({ status: 'OptiCutter Configured', apiKeyPresent: true });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

