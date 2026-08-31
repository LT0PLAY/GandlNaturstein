export const dynamic = 'force-dynamic'

import { createSupabaseAdminClient } from '@/lib/supabase'
import { getPageHeroImage } from '@/lib/actions/pageHeroes'
import PageHero from '@/components/public/PageHero'
import type { GuideEntry } from '@/lib/types'
import GuideSearch from './GuideSearch'

export const metadata = {
  title: 'Ausstellungsguide – Gandl Natursteine',
  description: 'Nummer am Ausstellungsstück eingeben und Produktdetails ansehen.',
}

async function getEntries(): Promise<GuideEntry[]> {
  try {
    const { data } = await createSupabaseAdminClient()
      .from('guide_entries')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('number')
    return (data as GuideEntry[]) ?? []
  } catch { return [] }
}

export default async function AusstellungsguidePage() {
  const [entries, heroImage] = await Promise.all([getEntries(), getPageHeroImage('guide')])

  return (
    <>
      {heroImage && (
        <PageHero
          label="// Vor Ort in der Ausstellung"
          title="Ausstellungsguide"
          subtitle="Jedes Ausstellungsstück trägt eine Nummer. Einfach die Nummer vom Schild eingeben und Sie sehen sofort, um welches Produkt es sich handelt."
          image={heroImage}
        />
      )}
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '64px 24px 100px' }}>
      {!heroImage && (
        <>
          <p style={{
            fontFamily: 'var(--font-inter)', fontSize: '13px', letterSpacing: '.14em',
            textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '14px',
          }}>
            // Vor Ort in der Ausstellung
          </p>
          <h1 style={{
            fontFamily: 'var(--font-bebas)', fontSize: 'clamp(40px, 6vw, 64px)', color: '#dcdcd6',
            letterSpacing: '.02em', lineHeight: '.95', marginBottom: '20px',
          }}>
            Ausstellungsguide
          </h1>
          <p style={{
            fontFamily: 'var(--font-inter)', fontSize: '16px', color: '#9caea1',
            lineHeight: 1.8, marginBottom: '40px', maxWidth: '620px',
          }}>
            Jedes Ausstellungsstück trägt eine Nummer. Einfach die Nummer vom Schild eingeben
            und Sie sehen sofort, um welches Produkt es sich handelt.
          </p>
        </>
      )}

      <GuideSearch entries={entries} />
    </div>
    </>
  )
}
