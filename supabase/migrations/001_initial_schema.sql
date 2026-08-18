-- ============================================================
-- Gandl Natursteine – Initiales Datenbankschema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  type        text not null check (type in ('aussen', 'innen', 'sonderanfertigung')),
  description text,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- Startwerte
insert into categories (name, slug, type, sort_order) values
  ('Pflaster',            'pflaster',           'aussen',           1),
  ('Stufen & Treppen',    'stufen-treppen',      'aussen',           2),
  ('Fassaden',            'fassaden',            'aussen',           3),
  ('Terrassen & Böden',   'terrassen-boeden',    'aussen',           4),
  ('Brunnenbecken',       'brunnenbecken',       'aussen',           5),
  ('Bodenbeläge Innen',   'bodenbelaege-innen',  'innen',            1),
  ('Treppen Innen',       'treppen-innen',       'innen',            2),
  ('Badezimmer',          'badezimmer',          'innen',            3),
  ('Küchenarbeitsplatten','kuechenarbeitsplatten','innen',            4),
  ('Maßanfertigung',      'massanfertigung',     'sonderanfertigung',1),
  ('Skulpturen & Kunst',  'skulpturen-kunst',    'sonderanfertigung',2),
  ('Restaurierung',       'restaurierung',       'sonderanfertigung',3);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text,
  category_id  uuid references categories(id) on delete set null,
  material     text,              -- z.B. "Granit", "Sandstein", "Marmor"
  surface      text,              -- z.B. "geflammt", "poliert", "gesägt"
  format       text,              -- z.B. "9/11 cm", "nach Maß"
  origin       text,              -- z.B. "Portugal", "Skandinavien"
  images       text[] default '{}', -- Supabase Storage URLs
  is_active    boolean default true,
  sort_order   integer default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

-- ============================================================
-- INQUIRIES (Warenanfrage-System)
-- ============================================================
create table inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  area_sqm    numeric(10,2),
  message     text,
  product_id  uuid references products(id) on delete set null,
  status      text default 'new' check (
                status in ('new', 'in_progress', 'completed', 'archived')
              ),
  internal_note text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create trigger inquiries_updated_at
  before update on inquiries
  for each row execute function update_updated_at();

-- Index für schnelle Status-Abfragen im Admin
create index inquiries_status_idx on inquiries(status);
create index inquiries_created_at_idx on inquiries(created_at desc);

-- ============================================================
-- TEAM MEMBERS (Business-Verwaltung)
-- ============================================================
create table team_members (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  name       text not null,
  email      text not null unique,
  role       text not null default 'editor' check (
               role in ('admin', 'editor', 'viewer')
             ),
  is_active  boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- CHANGE LOG (Änderungsprotokoll)
-- ============================================================
create table change_log (
  id           uuid primary key default gen_random_uuid(),
  action       text not null,          -- 'create' | 'update' | 'delete'
  entity_type  text not null,          -- 'product' | 'category' | 'inquiry'
  entity_id    uuid,
  entity_name  text,                   -- lesbarer Name für Anzeige
  changed_by   uuid references team_members(id) on delete set null,
  old_value    jsonb,
  new_value    jsonb,
  created_at   timestamptz default now()
);

create index change_log_entity_idx on change_log(entity_type, entity_id);
create index change_log_created_at_idx on change_log(created_at desc);

-- ============================================================
-- STORAGE BUCKETS (Supabase Storage)
-- ============================================================
-- Diese werden über das Supabase Dashboard oder CLI angelegt:
-- supabase storage create product-images --public
-- supabase storage create hero-videos    --public

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- CATEGORIES: öffentlich lesbar
alter table categories enable row level security;
create policy "categories_public_read"
  on categories for select using (true);
create policy "categories_admin_write"
  on categories for all
  using (
    exists (
      select 1 from team_members
      where user_id = auth.uid() and role = 'admin' and is_active = true
    )
  );

-- PRODUCTS: öffentlich lesbar (nur aktive), Admins/Editoren können schreiben
alter table products enable row level security;
create policy "products_public_read"
  on products for select using (is_active = true);
create policy "products_editor_write"
  on products for all
  using (
    exists (
      select 1 from team_members
      where user_id = auth.uid()
        and role in ('admin', 'editor')
        and is_active = true
    )
  );

-- INQUIRIES: nur Team-Mitglieder lesen/schreiben; jeder kann neue erstellen
alter table inquiries enable row level security;
create policy "inquiries_public_insert"
  on inquiries for insert with check (true);
create policy "inquiries_team_read"
  on inquiries for select
  using (
    exists (
      select 1 from team_members
      where user_id = auth.uid() and is_active = true
    )
  );
create policy "inquiries_team_update"
  on inquiries for update
  using (
    exists (
      select 1 from team_members
      where user_id = auth.uid()
        and role in ('admin', 'editor')
        and is_active = true
    )
  );

-- TEAM MEMBERS: nur Admins
alter table team_members enable row level security;
create policy "team_members_admin_only"
  on team_members for all
  using (
    exists (
      select 1 from team_members tm
      where tm.user_id = auth.uid() and tm.role = 'admin' and tm.is_active = true
    )
  );

-- CHANGE LOG: nur Team lesen, System schreibt
alter table change_log enable row level security;
create policy "change_log_team_read"
  on change_log for select
  using (
    exists (
      select 1 from team_members
      where user_id = auth.uid() and is_active = true
    )
  );


-- ============================================================
-- HAUPTADMIN SCHUTZ
-- ============================================================

-- Nur ein aktiver Admin erlaubt
CREATE OR REPLACE FUNCTION check_single_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' AND NEW.is_active = true THEN
    IF EXISTS (
      SELECT 1 FROM team_members
      WHERE role = 'admin'
        AND is_active = true
        AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Es kann nur einen Hauptadmin geben.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_admin
  BEFORE INSERT OR UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION check_single_admin();

