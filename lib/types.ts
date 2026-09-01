// ============================================================
// Gandl Natursteine – TypeScript Types (aus Supabase Schema)
// ============================================================

/** Hauptbereich (früher CategoryType) */
export type CategoryBereich  = 'eigenproduktion' | 'sonderanfertigung' | 'gartengestaltung' | 'extras'
/** Alias – type-Feld in der DB entspricht jetzt dem Bereich */
export type CategoryType     = CategoryBereich

export type InquiryStatus = 'new' | 'in_progress' | 'completed' | 'archived'
export type TeamRole     = 'admin' | 'editor' | 'viewer'
export type ChangeAction = 'create' | 'update' | 'delete'

// ============================================================
// DATABASE TYPES
// ============================================================

// ── Titelbilder für feste Seiten (Partner, Restposten, Ausstellungsguide,
// Karriere, Referenzen) — analog zum Kategorie-Titelbild, aber pro Seite. ──
export type PageHeroKey = 'partner' | 'restposten' | 'guide' | 'karriere' | 'referenzen'

export interface PageHero {
  page_key:   PageHeroKey
  image_url:  string | null
  updated_at: string
}

export const PAGE_HERO_LABELS: Record<PageHeroKey, string> = {
  partner:    'Unsere Partner',
  restposten: 'Aktuelle Restposten',
  guide:      'Ausstellungsguide',
  karriere:   'Karriere',
  referenzen: 'Referenzen',
}

export interface Category {
  id:          string
  name:        string
  slug:        string
  /** Hauptbereich: eigenproduktion | sonderanfertigung | gartengestaltung | extras */
  type:        CategoryBereich
  /** Titelbild / Hero-Banner der Kategorie */
  image_url:   string | null
  description: string | null
  sort_order:  number
  created_at:  string
}

// Bereich-Labels für UI
export const BEREICH_LABELS: Record<CategoryBereich, string> = {
  eigenproduktion:  'Eigenproduktion',
  sonderanfertigung: 'Sonderanfertigung',
  gartengestaltung:  'Gartengestaltung',
  extras:            'Extras',
}

export interface ProductSize {
  label:          string
  price?:         number | null
  article_number?: string | null
  /** Nur diese Oberflächen sind für diese Größe wählbar (leer/undefined = alle Oberflächen des Produkts) */
  surfaces?:      string[]
}

export interface Product {
  id:             string
  name:           string
  slug:           string
  article_number: string | null
  description:    string | null
  /** Hauptbereich – direkt am Produkt, unabhängig von einer evtl. Kategorie */
  bereich:        CategoryBereich | null
  category_id:    string | null
  material:       string | null
  surface:        string | null
  format:         string | null
  origin:         string | null
  /** Einsatzbereich, z.B. "Terrasse", "Bad", "Fassade" */
  einsatzbereich: string | null
  /** Farbe, z.B. "Grau", "Beige" */
  farbe:          string | null
  /** Kleines Icon/PNG, das als Overlay unten rechts im Produktbild angezeigt wird */
  icon_url:       string | null
  /** Optionale Größenvarianten (z.B. verschiedene Formate) mit eigenem Preis, statt separater Produkte */
  sizes:          ProductSize[]
  /** Optionale Oberflächen-Varianten (z.B. Poliert, Geflammt, Rau) — wählbar auf der Produktseite,
   *  kombiniert sich mit einer gewählten Größe, falls beides angelegt ist. */
  surfaces:       string[]
  unit:           ProductUnit
  price:          number | null
  show_price:     boolean
  images:         string[]
  thumbnail:      string | null
  image_alts:     Record<string, string>
  is_active:      boolean
  sort_order:     number
  created_at:     string
  updated_at:     string
  /** Optionale weitere Kategorien (Mehrfachzuordnung über product_categories) — category_id/category bleibt die Hauptkategorie */
  category_ids?:  string[]
  // Join
  category?:      Category
  /** Alle zugeordneten Kategorien (Haupt- + weitere), falls geladen */
  categories?:    Category[]
}

export interface Inquiry {
  id:            string
  name:          string
  email:         string
  phone:         string | null
  area_sqm:      number | null
  message:       string | null
  product_id:    string | null
  status:        InquiryStatus
  internal_note: string | null
  created_at:    string
  updated_at:    string
  // Join
  product?:      Pick<Product, 'id' | 'name' | 'slug'>
}

export interface TeamMember {
  id:         string
  user_id:    string
  name:       string
  email:      string
  role:       TeamRole
  is_active:  boolean
  created_at: string
}

export interface ChangeLog {
  id:          string
  action:      ChangeAction
  entity_type: string
  entity_id:   string | null
  entity_name: string | null
  changed_by:  string | null
  old_value:   Record<string, unknown> | null
  new_value:   Record<string, unknown> | null
  created_at:  string
  // Join
  team_member?: Pick<TeamMember, 'name' | 'email'>
}

// ============================================================
// BASKET (Anfragekorb)
// ============================================================

export type ProductUnit = 'stueck' | 'laufmeter' | 'qm' | 'gewicht' | 'groesse'
export type BasketUnit = ProductUnit

export const UNIT_LABELS: Record<ProductUnit, { short: string; long: string }> = {
  stueck:    { short: 'Stk.',  long: 'Stück'      },
  laufmeter: { short: 'lfm',   long: 'Laufmeter'  },
  qm:        { short: 'm²',    long: 'Quadratmeter (m²)' },
  gewicht:   { short: 'kg',    long: 'Gewicht (kg)' },
  groesse:   { short: 'Stk.',  long: 'Größe / Maße' },
}

/** Einheitlicher Hinweistext, der überall dort erscheint, wo dem Kunden ein
 *  Preis angezeigt wird — einmal als Zusatzhinweis, nicht bei jeder Zahl
 *  wiederholt (z.B. "0,42 € netto ab Lager zzgl. Verpackung"). */
export const PRICE_DISCLAIMER = 'netto ab Lager zzgl. Verpackung'

/** Wandelt einen (evtl. veralteten, z.B. 'm2' aus altem localStorage-Korb) Wert
 *  in eine gültige ProductUnit um – Fallback: 'qm'. */
export function normalizeUnit(u: unknown): ProductUnit {
  if (u === 'qm' || u === 'stueck' || u === 'laufmeter' || u === 'gewicht' || u === 'groesse') return u
  if (u === 'm2') return 'qm'
  return 'qm'
}

export interface BasketItem {
  productId:   string
  productName: string
  productSlug: string
  categoryType: CategoryType
  thumbnail:   string | null
  price:       number | null
  show_price:  boolean
  quantity:    number
  unit:        BasketUnit
  /** Woher der Eintrag stammt – fehlt = normales Katalogprodukt (Rückwärtskompatibilität) */
  sourceType?: 'product' | 'restposten' | 'guide'
  /** Gewählte Größenvariante (falls das Produkt mehrere Größen anbietet) */
  size?:       string | null
  /** Gewählte Oberflächen-Variante (falls das Produkt mehrere Oberflächen anbietet) */
  surface?:    string | null
}

// ============================================================
// FORM TYPES
// ============================================================

export interface InquiryFormData {
  name:       string
  email:      string
  phone?:     string
  area_sqm?:  number
  message?:   string
  product_id?: string
  consent:    boolean | string  // DSGVO-Zustimmung (Pflicht)
  website?:   string            // Honeypot – muss leer bleiben (Bot-Falle)
}

export interface ProductFormData {
  name:        string
  slug:        string
  description?: string
  category_id?: string
  material?:   string
  surface?:    string
  format?:     string
  origin?:     string
  is_active:   boolean
}

// ============================================================
// REFERENCES (Portfolio-Projekte)
// ============================================================

export type RefProduct = {
  id: string; name: string; slug: string
  thumbnail?: string | null; material?: string | null
  surface?: string | null; description?: string | null
  category?: { type: string } | null
}

export interface Reference {
  id:               string
  slug:             string
  title:            string
  subtitle:         string | null
  category_tags:    string[]
  year:             number | null
  description:      string | null
  cover_image:      string | null
  images:           string[]
  product_id:       string | null
  product_ids:      string[]
  spec_material:    string | null
  spec_surface:     string | null
  spec_scope:       string | null
  spec_location:    string | null
  meta_title:       string | null
  meta_description: string | null
  is_published:     boolean
  sort_order:       number
  created_at:       string
  updated_at:       string
  // Joined (legacy single)
  product?:         RefProduct | null
  // Joined (multi)
  linked_products?: RefProduct[]
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface JobListing {
  id:              string
  title:           string
  department:      string | null
  location:        string | null
  employment_type: string | null
  description:     string | null
  requirements:    string | null
  benefits:        string | null
  pdf_url:         string | null
  linkedin_url:    string | null
  images:          string[]
  is_published:    boolean
  sort_order:      number
  deleted_at:      string | null
  deleted_by:      string | null
  created_at:      string
  updated_at:      string
}

export interface PartnerPdf {
  title: string
  url:   string
}

export interface Partner {
  id:          string
  name:        string
  logo_url:    string | null
  website_url: string | null
  pdfs:        PartnerPdf[]
  is_active:   boolean
  sort_order:  number
  deleted_at:  string | null
  created_at:  string
  updated_at:  string
}

export type PopupLayout = 'standard' | 'din_a5'

export const POPUP_LAYOUT_LABELS: Record<PopupLayout, string> = {
  standard: 'Standard — Bild oben, Text darunter',
  din_a5:   'Poster / DIN A5 — großflächiges Bild im Hochformat (148×210 mm)',
}

export interface Popup {
  id:           string
  title:        string
  message:      string | null
  image_url:    string | null
  is_active:    boolean
  active_until: string | null
  /** Anzeigeformat: standard = kleines Bild + Text, din_a5 = ganzflächiges Poster im Hochformat */
  layout:       PopupLayout
  created_at:   string
  updated_at:   string
}

export interface Restposten {
  id:            string
  title:         string
  description:   string | null
  price:         number | null
  images:        string[]
  external_link: string | null
  is_active:     boolean
  sort_order:    number
  deleted_at:    string | null
  created_at:    string
  updated_at:    string
}

export interface GuideEntry {
  id:          string
  number:      number
  name:        string
  description: string | null
  images:      string[]
  product_id:  string | null
  is_active:   boolean
  sort_order:  number
  deleted_at:  string | null
  created_at:  string
  updated_at:  string
  // Join
  product?:    Product
}

export interface ApiResponse<T> {
  data:    T | null
  error:   string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data:       T[]
  total:      number
  page:       number
  per_page:   number
  has_more:   boolean
}
