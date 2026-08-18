-- Migration 015: Slug-Redirects für Produkte
-- Wenn ein Produkt-Slug geändert wird, wird die alte URL hier gespeichert
-- und automatisch auf die neue weitergeleitet.

create table if not exists product_slug_redirects (
  id         uuid primary key default gen_random_uuid(),
  old_slug   text not null,
  new_slug   text not null,
  section    text not null,  -- 'aussen' | 'innen' | 'sonderanfertigung' | 'extras'
  created_at timestamptz default now()
);

-- Index für schnelle Lookups beim Redirect
create index if not exists idx_product_slug_redirects_old_slug
  on product_slug_redirects (old_slug);
