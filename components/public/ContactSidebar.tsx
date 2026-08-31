'use client'

import { useState } from 'react'
import styles from './ContactSidebar.module.css'

const PHONE_DISPLAY = '08143-99740'
const PHONE_HREF    = '+498143997400'
const WHATSAPP_HREF = '498143997400'
const EMAIL         = 'info@gandl-natursteine.de'

const HOURS = [
  { days: 'Montag – Freitag', time: '8:00 – 12:00 / 13:00 – 17:00 Uhr' },
  { days: 'Samstag',          time: '9:00 – 12:00 Uhr' },
  { days: 'Abholungen Mo – Fr', time: 'bis 16:45 Uhr' },
]

const LOCATIONS = [
  {
    name:    'Hauptsitz – Inning am Ammersee',
    address: 'Rudolf-Diesel-Ring 6, 82266 Inning am Ammersee',
    phone:   null as { display: string; href: string } | null,
    email:   null as string | null,
  },
  {
    name:    'Gandl Natursteine GmbH – Kaisheim',
    address: 'Gewerbepark 11, 86687 Kaisheim',
    phone:   { display: '09099 966910', href: '+4909099966910' } as { display: string; href: string } | null,
    email:   null as string | null,
  },
  {
    name:    'Gandl Natursteine – Kirchheim',
    address: 'Konsul-Metzing-Str. 3, 97268 Kirchheim',
    phone:   { display: '+49 9366 99397', href: '+4993669397' } as { display: string; href: string } | null,
    email:   'info@gandl-kirchheim.de' as string | null,
  },
  {
    name:    'Baustoffe und Natursteine Hammerl GmbH – Pöttmes',
    address: 'Rudolf-Diesel-Str. 18, 86554 Pöttmes',
    phone:   { display: '08253 997600', href: '+498253997600' } as { display: string; href: string } | null,
    email:   'info@hammerl-baustoffe.de' as string | null,
  },
]

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export default function ContactSidebar() {
  const [openPanel, setOpenPanel] = useState<'phone' | 'hours' | 'maps' | null>(null)

  function toggle(panel: 'phone' | 'hours' | 'maps') {
    setOpenPanel((current) => (current === panel ? null : panel))
  }

  return (
    <div className={styles.sidebar}>
      {openPanel && (
        <div
          className={styles.backdrop}
          onClick={() => setOpenPanel(null)}
          aria-hidden="true"
        />
      )}
      <div className={styles.icons}>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${WHATSAPP_HREF}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.icon}
          aria-label="Per WhatsApp schreiben"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.36a9.9 9.9 0 0 0 4.62 1.14h.01c5.46 0 9.9-4.45 9.9-9.9C21.95 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.35-.5.05-1.03.28-3.5-.73-2.97-1.23-4.85-4.19-5-4.38-.15-.2-1.19-1.58-1.19-3.01 0-1.44.75-2.14 1.02-2.43.27-.29.58-.36.77-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.11.32.02.51-.1.2-.14.32-.28.5-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.16.28.71 1.18 1.53 1.91 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.17-.2.71-.83.9-1.11.19-.28.38-.24.63-.14.26.1 1.63.77 1.91.91.28.14.47.21.53.33.07.12.07.68-.17 1.36Z"/>
          </svg>
        </a>

        {/* Telefon */}
        <div className={styles.popoverWrap}>
          <button
            type="button"
            className={styles.icon}
            aria-label="Telefonnummer anzeigen"
            onClick={() => toggle('phone')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92Z"/>
            </svg>
          </button>
          {openPanel === 'phone' && (
            <div className={styles.popover}>
              <button
                type="button"
                className={styles.popoverClose}
                onClick={() => setOpenPanel(null)}
                aria-label="Schließen"
              >
                ✕
              </button>
              <p className={styles.popoverTitle}>Bestellung &amp; Beratung unter:</p>
              <a href={`tel:${PHONE_HREF}`} className={styles.phoneLink}>{PHONE_DISPLAY}</a>
            </div>
          )}
        </div>

        {/* E-Mail */}
        <a href={`mailto:${EMAIL}`} className={styles.icon} aria-label="E-Mail schreiben">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m2 7 10 6 10-6"/>
          </svg>
        </a>

        {/* Öffnungszeiten */}
        <div className={styles.popoverWrap}>
          <button
            type="button"
            className={styles.icon}
            aria-label="Öffnungszeiten anzeigen"
            onClick={() => toggle('hours')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 3"/>
            </svg>
          </button>
          {openPanel === 'hours' && (
            <div className={styles.popover}>
              <button
                type="button"
                className={styles.popoverClose}
                onClick={() => setOpenPanel(null)}
                aria-label="Schließen"
              >
                ✕
              </button>
              <p className={styles.popoverTitle}>Öffnungszeiten</p>
              {HOURS.map((h) => (
                <div key={h.days} className={styles.popoverRow}>
                  <span>{h.days}</span>
                  <span>{h.time}</span>
                </div>
              ))}
              <p className={styles.popoverNote}>Sonntag ist die Ausstellung geschlossen</p>
            </div>
          )}
        </div>

        {/* Google Maps – alle Standorte */}
        <div className={styles.popoverWrap}>
          <button
            type="button"
            className={styles.icon}
            aria-label="Standorte auf Google Maps anzeigen"
            onClick={() => toggle('maps')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z"/>
              <circle cx="12" cy="10" r="2.5"/>
            </svg>
          </button>
          {openPanel === 'maps' && (
            <div className={styles.popover}>
              <button
                type="button"
                className={styles.popoverClose}
                onClick={() => setOpenPanel(null)}
                aria-label="Schließen"
              >
                ✕
              </button>
              <p className={styles.popoverTitle}>Unsere Standorte</p>
              {LOCATIONS.map((loc) => (
                <div key={loc.name} className={styles.locationBlock}>
                  <a
                    href={mapsUrl(loc.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.locationLink}
                  >
                    <strong>{loc.name}</strong>
                    <span>{loc.address}</span>
                  </a>
                  {(loc.phone || loc.email) && (
                    <div className={styles.locationContact}>
                      {loc.phone && (
                        <a href={`tel:${loc.phone.href}`} className={styles.locationContactLink}>
                          {loc.phone.display}
                        </a>
                      )}
                      {loc.email && (
                        <a href={`mailto:${loc.email}`} className={styles.locationContactLink}>
                          {loc.email}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
