-- Create drafts table
CREATE TABLE IF NOT EXISTS drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    subject TEXT,
    body TEXT,
    "to" JSONB DEFAULT '[]'::jsonb,
    cc JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(thread_id)
);

-- Create synonyms table
CREATE TABLE IF NOT EXISTS synonyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_term TEXT NOT NULL,
    synonym_term TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(synonym_term) -- Synonyms should be unique to avoid ambiguity
);

-- Create index for faster synonym lookups
CREATE INDEX IF NOT EXISTS idx_synonyms_term ON synonyms(synonym_term);

-- Migrate existing drafts from threads table (if any)
-- Note: This assumes the 'draft' column in threads is a JSONB object with subject, body, to, cc
INSERT INTO drafts (thread_id, subject, body, "to", cc, updated_at)
SELECT 
    id, 
    (draft->>'subject')::text, 
    (draft->>'body')::text, 
    COALESCE((draft->'to'), '[]'::jsonb), 
    COALESCE((draft->'cc'), '[]'::jsonb), 
    updated_at
FROM threads 
WHERE draft IS NOT NULL AND draft::text != 'null'
ON CONFLICT (thread_id) DO UPDATE 
SET 
    subject = EXCLUDED.subject,
    body = EXCLUDED.body,
    "to" = EXCLUDED."to",
    cc = EXCLUDED.cc,
    updated_at = EXCLUDED.updated_at;
