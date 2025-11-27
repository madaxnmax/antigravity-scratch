const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSynonyms() {
    const synonymPath = path.join(__dirname, 'src/services/synonym_dictionary.json');
    const rawData = fs.readFileSync(synonymPath, 'utf-8');
    const synonymDict = JSON.parse(rawData);

    console.log('Seeding synonyms...');

    const rows = [];
    for (const [standard, synonyms] of Object.entries(synonymDict)) {
        for (const synonym of synonyms) {
            rows.push({
                standard_term: standard,
                synonym_term: synonym
            });
        }
    }

    // Insert in batches to avoid limits (though 300 is small enough for one go)
    const { error } = await supabase
        .from('synonyms')
        .upsert(rows, { onConflict: 'synonym_term' });

    if (error) {
        console.error('Error seeding synonyms:', error);
    } else {
        console.log(`Successfully seeded ${rows.length} synonyms.`);
    }
}

seedSynonyms();
