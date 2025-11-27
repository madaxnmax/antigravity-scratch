-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'Sheet', 'Rod', 'Tube', 'FilamentTube'
    sku TEXT,
    grade TEXT,
    length NUMERIC,
    width NUMERIC,
    thickness NUMERIC,
    diameter NUMERIC,
    thickness_plus NUMERIC,
    thickness_minus NUMERIC,
    kerf NUMERIC,
    price_st_st NUMERIC,
    price_st_plus_5 NUMERIC,
    price_ds_ds NUMERIC,
    price_fab NUMERIC,
    price_oem NUMERIC,
    price_retail NUMERIC,
    cost_per_kg NUMERIC,
    cost_per_batch NUMERIC,
    cost_per_setup NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on type for faster filtering
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);
