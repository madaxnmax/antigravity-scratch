const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking drafts table...');
    const { data: drafts, error: draftsError } = await supabase
        .from('drafts')
        .select('*')
        .limit(1);

    if (draftsError) {
        console.error('Error fetching drafts:', draftsError);
    } else {
        console.log(`Found ${drafts ? drafts.length : 0} drafts (sample).`);
    }
}

checkData();
