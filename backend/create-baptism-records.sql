-- Create baptism_records table for tracking baptism/christening records

CREATE TABLE IF NOT EXISTS baptism_records (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    child_baptism_name VARCHAR(200) NOT NULL,
    child_call_name VARCHAR(200),
    father_name VARCHAR(200),
    mother_name VARCHAR(200),
    parents_nationality VARCHAR(100),
    child_birth_date DATE,
    child_baptism_date DATE,
    godparent_name VARCHAR(200),
    baptism_church VARCHAR(200),
    priest_name VARCHAR(200),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_baptism_records_active ON baptism_records(is_active);
CREATE INDEX IF NOT EXISTS idx_baptism_records_date ON baptism_records(event_date DESC);
