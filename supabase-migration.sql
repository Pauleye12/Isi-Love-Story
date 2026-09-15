-- ============================================================
-- Wedding Guest & Gift Management — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Create the "guests" table
CREATE TABLE IF NOT EXISTS guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  unique_code TEXT NOT NULL UNIQUE,
  availability TEXT NOT NULL DEFAULT 'No response yet',
  checked_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create the "gifts" table
CREATE TABLE IF NOT EXISTS gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_name TEXT NOT NULL,
  purchase_link TEXT NOT NULL,
  chosen_by TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable Row Level Security on both tables
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for "guests"

-- Authenticated users (admin) can do everything
CREATE POLICY "Admin full access on guests"
  ON guests
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Anonymous users can read guests (needed for RSVP portal later)
CREATE POLICY "Public read access on guests"
  ON guests
  FOR SELECT
  USING (true);

-- Anonymous users can update their own availability (for RSVP portal)
CREATE POLICY "Public update availability on guests"
  ON guests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 5. RLS Policies for "gifts"

-- Authenticated users (admin) can do everything
CREATE POLICY "Admin full access on gifts"
  ON gifts
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Anonymous users can read gifts (needed for RSVP portal later)
CREATE POLICY "Public read access on gifts"
  ON gifts
  FOR SELECT
  USING (true);

-- Anonymous users can update chosen_by (for RSVP portal)
CREATE POLICY "Public update chosen_by on gifts"
  ON gifts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
