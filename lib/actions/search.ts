'use server'

import { createSupabaseAdminClient } from '@/lib/supabase'
import type { CategoryBereich } from '@/lib/types'
import { BEREICH_LABELS } from '@/lib/types'

export interface SearchResult {
  id:             string
  name:           string
  slug:           string
  article_number: string | null
  thumbnail:      string | null
  material:       string | null
  surface:        string | null
  /** Alle Oberflächen-Varianten des Produkts (leer, wenn nur das Einzelfeld "surface" gepflegt ist) */
  surfaces:       string[]
  description:    string | null
  /** Hauptbereich (eigenproduktion, gartengestaltung, ...) — bestimmt die URL */
  categoryType:   CategoryBereich
  categoryName:   string | null
}

// Felder, in denen jeder einzelne Suchbegriff (Token) gefunden werden darf.
const SEARCHABLE_COLUMNS = [
  'name',
  'material',
  'surface',
  'format',
  'einsatzbereich',
  'farbe',
  'description',
  'origin',
  'article_number',
]

// Escaped einen Wert für die PostgREST ilike-Pattern-Syntax (Kommas/Klammern
// stören sonst die .or()-Filterliste).
function escapeForOr(value: string) {
  return value.replace(/[%,()]/g, (c) => `\\${c}`)
}

// Zerlegt die Eingabe in einzelne Suchbegriffe (Wörter, Zahlen, Zahlenkombis).
// "grau 30x30" -> ["grau", "30x30"], "grau, 30 x 30" -> ["grau", "30", "x", "30"]
function tokenize(query: string): string[] {
  return query
    .trim()
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

// Bereichs-Namen (z. B. "Garten" -> gartengestaltung) für die Freitextsuche
// mit auflösen, damit z. B. "garten" oder "sonderanfertigung" Treffer liefert.
function matchingBereiche(token: string): CategoryBereich[] {
  const t = token.toLowerCase()
  return (Object.keys(BEREICH_LABELS) as CategoryBereich[]).filter(
    (key) => key.includes(t) || BEREICH_LABELS[key].toLowerCase().includes(t)
  )
}

// Kategorienamen, die zu einem Suchbegriff passen (z. B. "pflege" -> Kategorie
// "Pflegemittel") — dadurch findet man Produkte auch über ihre Kategorie,
// selbst wenn der Begriff nirgends im Produkttext selbst vorkommt.
async function matchingCategoryIds(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  token: string
): Promise<string[]> {
  try {
    const { data } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', `%${token}%`)
    return (data ?? []).map((c: any) => c.id)
  } catch {
    return []
  }
}

export async function searchProducts(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return []

  const supabase = createSupabaseAdminClient()
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  // Für jeden Token: er muss in mindestens einem Feld, einem Bereich oder dem
  // Namen der zugeordneten Kategorie vorkommen. Über alle Tokens hinweg wird
  // UND verknüpft, damit z. B. "grau 30x30" auch wirklich beide Eigenschaften
  // gemeinsam verlangt.
  let builder = supabase
    .from('products')
    .select('id, name, slug, article_number, thumbnail, material, surface, surfaces, description, bereich, format, einsatzbereich, farbe, category:categories!products_category_id_fkey(name, type)')
    .eq('is_active', true)

  for (const token of tokens) {
    const t = escapeForOr(token)
    const fieldConditions = SEARCHABLE_COLUMNS.map((col) => `${col}.ilike.%${t}%`)
    const bereiche = matchingBereiche(token)
    const bereichCondition = bereiche.length ? [`bereich.in.(${bereiche.join(',')})`] : []
    const categoryIds = await matchingCategoryIds(supabase, t)
    const categoryCondition = categoryIds.length ? [`category_id.in.(${categoryIds.join(',')})`] : []
    // "surfaces" ist ein text[] und per ilike nicht durchsuchbar — dafür gibt es
    // die generierte Textspalte surfaces_text (Migration 030).
    // Gleiches gilt für die Größenvarianten (sizes_text, Migration 031).
    const surfacesCondition = [`surfaces_text.ilike.%${t}%`, `sizes_text.ilike.%${t}%`]
    builder = builder.or([...fieldConditions, ...surfacesCondition, ...bereichCondition, ...categoryCondition].join(','))
  }

  const { data, error } = await builder.limit(12)

  if (error || !data) return []

  const results: SearchResult[] = data.map((p: any) => ({
    id:             p.id,
    name:           p.name,
    slug:           p.slug,
    article_number: p.article_number ?? null,
    thumbnail:      p.thumbnail,
    material:       p.material,
    surface:        p.surface,
    surfaces:       p.surfaces ?? [],
    description:    p.description,
    categoryType:   (p.bereich ?? p.category?.type ?? 'eigenproduktion') as CategoryBereich,
    categoryName:   p.category?.name ?? null,
  }))

  // Bei mehrdeutigen Treffern (z. B. Volltextsuche über mehrere lockere
  // Felder) Ergebnisse bevorzugen, deren Name den ersten Suchbegriff enthält.
  const first = tokens[0].toLowerCase()
  results.sort((a, b) => {
    const aHit = a.name.toLowerCase().includes(first) ? 0 : 1
    const bHit = b.name.toLowerCase().includes(first) ? 0 : 1
    return aHit - bHit
  })

  return results.slice(0, 8)
}
