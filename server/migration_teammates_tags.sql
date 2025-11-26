-- Create Teammates table
CREATE TABLE IF NOT EXISTS teammates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'Member',
    status TEXT DEFAULT 'Active',
    date_invited TIMESTAMPTZ DEFAULT NOW()
);

-- Create Tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    parent_id UUID REFERENCES tags(id),
    show_in_list BOOLEAN DEFAULT TRUE,
    available_everywhere BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Optional but good practice, though we might not have policies set up yet)
ALTER TABLE teammates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all access for now (since we are in dev/prototype mode)
CREATE POLICY "Allow all access to teammates" ON teammates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to tags" ON tags FOR ALL USING (true) WITH CHECK (true);
