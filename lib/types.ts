// ============================================================
// Gandl Natursteine – TypeScript Types (aus Supabase Schema)
// ============================================================

/** Hauptbereich (früher CategoryType) */
export type CategoryBereich  = 'massivproduktion' | 'sonderanfertigung' | 'gartengestaltung' | 'extras'
/** Außen/Innen – nur bei Bereichen außer 'extras' */
export type CategoryLocation = 'aussen' | 'innen'
/** Alias – type-Feld in der DB entspricht jetzt dem Bereich */
export type CategoryType     = CategoryBereich

export type InquiryStatus = 'new' | 'in_progress' | 'completed' | 'archived'
export type TeamRole     = 'admin' | 'editor' | 'viewer'
export type ChangeAction = 'create' | 'update' | 'delete'

// ============================================================
// DATABASE TYPES
// ============================================================

export interface Category {
  id:          string
  name:        string
  slug:        string
  /** Hauptbereich: massivproduktion | sonderanfertigung | gartengestaltung | extras */
  type:        CategoryBereich
  /** Standort: aussen | innen | null (für extras/sonderanfertigung ohne Split) */
  location:    CategoryLocation | null
  description: string | null
  sort_order:  number
  created_at:  string
}

// Bereich-Labels für UI
export const BEREICH_LABELS: Record<CategoryBereich, string> = {
  massivproduktion:  'Massivproduktion',
  sonderanfertigung: 'Sonderanfertigung',
  gartengestaltung:  'Gartengestaltung',
  extras:            'Extras',
}

export const LOCATION_LABELS: Record<CategoryLocation, string> = {
  aussen: 'Außenbereich',
  innen:  'Innenbereich',
}

export interface Product {
  id:             string
  name:           string
  slug:           string
  article_number: string | null
  description:    string | null
  category_id:    string | null
  material:       string | null
  surface:        string | null
  format:         string | null
  origin:         string | null
  price:          number | null
  show_price:     boolean
  images:         string[]
  thumbnail:      string | null
  image_alts:     Record<string, string>
  is_active:      boolean
  sort_order:     number
  created_at:     string
  updated_at:     string
  // Join
  category?:      Category
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

export type BasketUnit = 'm2' | 'stueck'

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
  category?: { type: string; location: string | null } | null
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
