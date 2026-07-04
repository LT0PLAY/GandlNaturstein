-- Migration 016: Artikelnummer für Produkte
-- Optionales Freitextfeld, das der Admin selbst vergeben kann.
-- Kein UNIQUE-Constraint, da Gandl das selbst kontrollieren will.

alter table products
  add column if not exists article_number text default null;

-- Index für schnelle Suche nach Artikelnummer
create index if not exists idx_products_article_number
  on products (article_number)
  where article_number is not null;
