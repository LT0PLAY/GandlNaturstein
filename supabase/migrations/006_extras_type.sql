-- Migration 006: Add 'extras' to category type constraint
-- Run in Supabase SQL Editor

-- Drop existing CHECK constraint and recreate with 'extras' included
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_type_check;
ALTER TABLE categories ADD CONSTRAINT categories_type_check
  CHECK (type IN ('aussen', 'innen', 'sonderanfertigung', 'extras'));
