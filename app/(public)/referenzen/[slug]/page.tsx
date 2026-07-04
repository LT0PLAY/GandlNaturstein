import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { Reference } from '@/lib/types'
import SideCarousel from '@/components/public/SideCarousel'
import { canonical, referenceJsonLd, SITE_NAME } from '@/lib/seo'

async function getRef(slug: string): Promise<Reference | null> {
  const supabase = createSupabaseAdminClient()
  const { data: ref } = await supabase
    .from('project_references')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (!ref) return null

  // Verknüpfte Produkte laden (product_ids Array, Fallback auf product_id)
  const ids: string[] = (ref.product_ids?.length > 0)
    ? ref.product_ids
    : ref.product_id ? [ref.product_id] : []

  let linked_products: Reference['linked_products'] = []
  if (ids.length > 0) {
    const { data: prods } = await supabase
      .from('products')
      .select('id, name, slug, thumbnail, material, surface, description, category:categories(type, location)')
      .in('id', ids)
    linked_products = (prods ?? []) as any
  }

  return { ...ref, linked_products } as Reference
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const ref = await getRef(slug)
  if (!ref) return { title: 'Nicht gefunden – Gandl Natursteine' }
  const title       = ref.meta_title       ?? `${ref.title} – Referenzprojekt | ${SITE_NAME}`
  const description = ref.meta_description ?? ref.description?.slice(0, 155) ?? `Referenzprojekt von ${SITE_NAME}: ${ref.title}.`
  return {
    title, description,
    alternates: { canonical: canonical(`/referenzen/${ref.slug}`) },
    openGraph: {
      title, description,
      images: ref.cover_image ? [{ url: ref.cover_image, alt: ref.title }] : [],
      type: 'article',
    },
  }
}

export default async function ReferenzDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const ref = await getRef(slug)
  if (!ref) notFound()

  const linkedProducts = (ref.linked_products ?? []) as any[]
  const jsonLd = referenceJsonLd(ref!)

  function productHref(p: any): string {
    const type     = p.category?.type     as string | undefined
    const location = p.category?.location as string | undefined
    if (type === 'sonderanfertigung') return `/sonderanfertigung/${p.slug}`
    if (type === 'extras')            return `/extras/${p.slug}`
    return `/${location ?? 'aussen'}/${p.slug}`
  }

  const specs = [
    { label: 'Material',        value: ref.spec_material },
    { label: 'Oberfläche',      value: ref.spec_surface },
    { label: 'Leistungsumfang', value: ref.spec_scope },
    { label: 'Standort',        value: ref.spec_location },
    { label: 'Jahr',            value: ref.year?.toString() },
  ].filter((s) => s.value)

  // Galerie-Bilder (ohne Cover)
  const galleryImages = (ref.images ?? []).slice(0, 6)
  // Falls keine Galerie: Cover als Fallback
  const carouselImages = galleryImages.length > 0
    ? galleryImages
    : ref.cover_image ? [ref.cover_image] : []

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* ── HERO: Vollbild mit Cover ── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        background: '#080806',
      }}>
        {ref.cover_image && (
          <>
            <img
              src={ref.cover_image}
              alt={ref.title}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.45) saturate(0.75)',
              }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: `
                radial-gradient(ellipse 90% 70% at 65% 40%, transparent 20%, rgba(8,8,6,0.5) 70%, rgba(8,8,6,0.9) 100%),
                linear-gradient(to bottom, rgba(8,8,6,0.6) 0%, transparent 25%, transparent 50%, rgba(8,8,6,0.98) 100%),
                linear-gradient(to right, rgba(8,8,6,0.7) 0%, transparent 25%, transparent 75%, rgba(8,8,6,0.4) 100%)
              `,
            }} />
          </>
        )}

        {/* Zurück-Link */}
        <div style={{ position: 'absolute', top: '32px', left: '40px', zIndex: 10 }}>
          <Link
            href="/referenzen"
            style={{
              fontFamily: 'var(--font-inter)', fontSize: '11px',
              letterSpacing: '.12em', textTransform: 'uppercase',
              color: 'rgba(240,235,227,0.45)', textDecoration: 'none',
            }}
          >
            ← Zurück zum Portfolio
          </Link>
        </div>

        {/* Titel-Block */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 40px 72px', maxWidth: '900px' }}>
          {(ref.category_tags?.length > 0 || ref.year) && (
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '11px',
              letterSpacing: '.18em', textTransform: 'uppercase',
              color: 'var(--color-gold)', marginBottom: '14px',
            }}>
              {[...(ref.category_tags ?? []), ref.year].filter(Boolean).join(' · ')}
            </p>
          )}
          <h1 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(48px, 8vw, 96px)',
            color: '#F0EBE3', letterSpacing: '.03em', lineHeight: '.92',
            marginBottom: '12px',
          }}>
            {ref.title}
          </h1>
          {ref.subtitle && (
            <p style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(22px, 3.5vw, 40px)',
              color: 'var(--color-gold)', letterSpacing: '.06em',
            }}>
              {ref.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* ── HAUPTINHALT: Carousel links | Beschreibung rechts ── */}
      {(carouselImages.length > 0 || ref.description) && (
        <section style={{ background: '#0A0907' }}>
          <div className="ref-detail-main">

            {/* ── Links: Slideshow ── */}
            {carouselImages.length > 0 && (
              <div className="ref-detail-carousel">
                <SideCarousel images={carouselImages} title={ref.title} />
              </div>
            )}

            {/* ── Rechts: Beschreibung ── */}
            {ref.description && (
              <div className="ref-detail-desc">
                <p style={{
                  fontFamily: 'var(--font-inter)', fontSize: '10px',
                  letterSpacing: '.18em', textTransform: 'uppercase',
                  color: 'var(--color-gold)', marginBottom: '20px',
                }}>
                  Das Projekt
                </p>
                <p style={{
                  fontFamily: 'var(--font-inter)', fontSize: '16px',
                  color: 'var(--color-text-muted)', lineHeight: 1.85,
                  whiteSpace: 'pre-wrap',
                }}>
                  {ref.description}
                </p>
                {linkedProducts.length > 0 && (
                  <Link
                    href={productHref(linkedProducts[0])}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      marginTop: '28px',
                      fontFamily: 'var(--font-inter)', fontSize: '12px',
                      letterSpacing: '.08em', textTransform: 'uppercase',
                      color: 'var(--color-gold)', textDecoration: 'none',
                    }}
                  >
                    {linkedProducts.length === 1
                      ? 'Zum verwendeten Produkt →'
                      : `${linkedProducts.length} verwendete Produkte ansehen →`}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── Specs: horizontale Reihe ── */}
          {specs.length > 0 && (
            <div className="ref-detail-specs">
              {specs.map(({ label, value }, i) => (
                <div key={label} className="ref-spec-item">
                  {i > 0 && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: '0.5px', height: '40px',
                      background: 'rgba(196,146,58,0.15)',
                    }} />
                  )}
                  <p style={{
                    fontFamily: 'var(--font-inter)', fontSize: '9px',
                    letterSpacing: '.16em', textTransform: 'uppercase',
                    color: 'rgba(196,146,58,0.5)', marginBottom: '6px',
                  }}>
                    {label}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-inter)', fontSize: '14px',
                    color: '#F0EBE3', fontWeight: 500,
                  }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── VERWENDETE PRODUKTE ── */}
      {linkedProducts.length > 0 && (
        <section style={{
          background: '#080806',
          borderTop: '0.5px solid rgba(196,146,58,0.08)',
          padding: '64px 40px',
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <p style={{
              fontFamily: 'var(--font-inter)', fontSize: '10px',
              letterSpacing: '.2em', textTransform: 'uppercase',
              color: 'rgba(196,146,58,0.6)',
              marginBottom: '28px',
            }}>
              {linkedProducts.length === 1 ? 'Verwendetes Produkt' : 'Verwendete Produkte'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {linkedProducts.map((p: any) => (
                <Link key={p.id} href={productHref(p)} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="ref-product-card">
                    <div className="ref-product-img">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover',
                            filter: 'brightness(0.8) saturate(0.8)',
                            transition: 'transform .5s ease, filter .3s ease',
                          }}
                          className="ref-product-thumb"
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          background: 'linear-gradient(135deg, #1A1610 0%, #0E0C08 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '14px',
                            letterSpacing: '.12em', color: 'rgba(196,146,58,0.3)' }}>GANDL</span>
                        </div>
                      )}
                    </div>
                    <div className="ref-product-info">
                      {p.material && (
                        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '11px',
                          letterSpacing: '.18em', textTransform: 'uppercase',
                          color: 'var(--color-gold)', marginBottom: '10px' }}>
                          {p.material}
                        </p>
                      )}
                      <h3 style={{ fontFamily: 'var(--font-bebas)',
                        fontSize: 'clamp(28px, 3.5vw, 44px)',
                        color: '#F0EBE3', letterSpacing: '.04em', lineHeight: 1,
                        marginBottom: '12px' }}>
                        {p.name}
                      </h3>
                      {p.surface && (
                        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px',
                          color: 'rgba(240,235,227,0.4)', letterSpacing: '.04em',
                          marginBottom: '16px' }}>
                          {p.surface}
                        </p>
                      )}
                      {p.description && (
                        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px',
                          color: 'var(--color-text-muted)', lineHeight: 1.75, maxWidth: '480px',
                          display: '-webkit-box', WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          marginBottom: '24px',
                        } as React.CSSProperties}>
                          {p.description}
                        </p>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px',
                        fontFamily: 'var(--font-bebas)', fontSize: '14px',
                        letterSpacing: '.14em', color: '#C4923A',
                        border: '0.5px solid rgba(196,146,58,0.4)',
                        padding: '10px 24px', transition: 'background .2s' }}>
                        PRODUKT ANSEHEN →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{
        padding: '100px 40px',
        textAlign: 'center',
        background: 'linear-gradient(to bottom, #0A0907 0%, #0D0D0C 100%)',
        borderTop: '0.5px solid rgba(196,146,58,0.08)',
        position: 'relative', overflow: 'hidden',
      }}>
        <p style={{
          position: 'absolute',
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(80px, 14vw, 160px)',
          color: 'rgba(196,146,58,0.04)',
          letterSpacing: '.04em', userSelect: 'none',
          left: '50%', transform: 'translateX(-50%)',
          whiteSpace: 'nowrap', pointerEvents: 'none',
          top: '50%', marginTop: '-0.5em',
        }}>
          GANDL
        </p>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(40px, 7vw, 72px)',
            color: '#F0EBE3', letterSpacing: '.04em',
            marginBottom: '8px',
          }}>
            Bereit für Ihr Projekt?
          </h2>
          <p style={{
            fontFamily: 'var(--font-inter)', fontSize: '14px',
            color: 'var(--color-text-muted)', marginBottom: '36px',
          }}>
            Sprechen Sie uns an — wir beraten Sie persönlich und unverbindlich.
          </p>
          <Link
            href="/kontakt"
            style={{
              display: 'inline-block',
              padding: '16px 48px',
              background: 'var(--color-gold)',
              color: '#0D0D0C',
              fontFamily: 'var(--font-bebas)', fontSize: '16px',
              letterSpacing: '.14em', textDecoration: 'none',
            }}
          >
            Anfrage senden
          </Link>
        </div>
      </section>

      <style>{`
        /* Hauptbereich: Carousel + Beschreibung nebeneinander */
        .ref-detail-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 520px;
        }
        .ref-detail-carousel {
          position: relative;
        }
        .ref-detail-desc {
          padding: 64px 56px 64px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #0A0907;
        }

        /* Specs: horizontale Reihe */
        .ref-detail-specs {
          display: flex;
          border-top: 0.5px solid rgba(196,146,58,0.1);
          background: #080806;
        }
        .ref-spec-item {
          flex: 1;
          padding: 28px 32px;
          position: relative;
          border-right: none;
        }

        /* Tablet */
        @media (max-width: 900px) {
          .ref-detail-main { grid-template-columns: 1fr; }
          .ref-detail-carousel { min-height: 340px; }
          .ref-detail-desc { padding: 40px 32px; }
          .ref-detail-specs { flex-wrap: wrap; }
          .ref-spec-item { flex: 0 0 50%; padding: 20px 24px; }
        }
        /* Mobile */
        @media (max-width: 520px) {
          .ref-detail-desc { padding: 32px 20px; }
          .ref-spec-item { flex: 0 0 100%; }
          .ref-spec-item .sep { display: none; }
        }

        /* Produkt-Card */
        .ref-product-card {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 0;
          border: 0.5px solid rgba(196,146,58,0.1);
          overflow: hidden;
          transition: border-color .3s;
        }
        .ref-product-card:hover {
          border-color: rgba(196,146,58,0.3);
        }
        .ref-product-img {
          position: relative;
          height: 300px;
          overflow: hidden;
          background: #0E0C08;
        }
        .ref-product-card:hover .ref-product-thumb {
          transform: scale(1.04);
          filter: brightness(0.9) saturate(0.9);
        }
        .ref-product-info {
          padding: 40px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #0D0B09;
        }
        @media (max-width: 760px) {
          .ref-product-card { grid-template-columns: 1fr; }
          .ref-product-img { height: 220px; }
          .ref-product-info { padding: 28px 24px; }
        }
      `}</style>
    </>
  )
}
