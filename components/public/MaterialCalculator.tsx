'use client'

import { useMemo, useState } from 'react'
import styles from './MaterialCalculator.module.css'

type Tab = 'kies' | 'pflaster' | 'mauer'

const TABS: { key: Tab; label: string }[] = [
  { key: 'kies',     label: 'Zierkies & Splitt' },
  { key: 'pflaster', label: 'Pflastersteine' },
  { key: 'mauer',    label: 'Trockenmauer' },
]

function fmtKg(kg: number) {
  return kg.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' kg'
}
function fmtT(kg: number) {
  return (kg / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' t'
}

// ── Zierkies & Ziersplitt ──────────────────────────────────────────────────
// Grundlage: 1 m² Fläche bei 1 cm Aufschütthöhe ≈ 16 kg Material (unabhängig
// von der Körnung) — aus der bestehenden Bedarfstabelle abgeleitet.
const KIES_KG_PRO_CM = 16
const KIES_HOEHEN = [3, 4, 5, 6, 7]

function KiesCalculator() {
  const [flaeche, setFlaeche]   = useState('')
  const [hoehe, setHoehe]       = useState(4)
  const [reserve, setReserve]   = useState(true)

  const result = useMemo(() => {
    const f = parseFloat(flaeche.replace(',', '.'))
    if (!f || f <= 0) return null
    const kgProM2 = hoehe * KIES_KG_PRO_CM
    const basis = kgProM2 * f
    const total = reserve ? basis * 1.1 : basis
    return { kgProM2, total }
  }, [flaeche, hoehe, reserve])

  return (
    <>
      <div className={styles.field}>
        <label>Fläche (m²)</label>
        <input
          type="text" inputMode="decimal" placeholder="z. B. 12"
          value={flaeche} onChange={(e) => setFlaeche(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label>Aufschütthöhe</label>
        <div className={styles.chipRow}>
          {KIES_HOEHEN.map((h) => (
            <button
              key={h} type="button"
              className={`${styles.chip} ${hoehe === h ? styles.chipActive : ''}`}
              onClick={() => setHoehe(h)}
            >
              {h} cm
            </button>
          ))}
        </div>
      </div>
      <label className={styles.checkboxRow}>
        <input type="checkbox" checked={reserve} onChange={(e) => setReserve(e.target.checked)} />
        + 10 % Reserve (Verdichtung, Unebenheiten)
      </label>

      <div className={styles.result}>
        {result ? (
          <>
            <div className={styles.resultRow}>
              <span>Bedarf pro m²</span>
              <span>{fmtKg(result.kgProM2)}</span>
            </div>
            <div className={styles.resultTotal}>
              <span>Gesamtbedarf</span>
              <strong>{fmtKg(result.total)} <small>· {fmtT(result.total)}</small></strong>
            </div>
          </>
        ) : (
          <p className={styles.resultEmpty}>Fläche eingeben, um den Bedarf zu berechnen.</p>
        )}
      </div>
      <p className={styles.hint}>Richtwerte, können je nach Material, Kornform und Verdichtung um ±10 % variieren.</p>
    </>
  )
}

// ── Pflastersteine — Ergiebigkeit pro Tonne ────────────────────────────────
// Mittelwerte aus den Praxiswerten (Rohdichte ca. 2,65 t/m³, ca. 1 cm Fuge).
const PFLASTER_GROESSEN = [
  { key: '4/6',   label: '4/6 cm',   m2ProT: 9.5,  lfmProT: 190  },
  { key: '7/9',   label: '7/9 cm',   m2ProT: 5.75, lfmProT: 112.5 },
  { key: '8/10',  label: '8/10 cm',  m2ProT: 5.0,  lfmProT: 87.5 },
  { key: '9/11',  label: '9/11 cm',  m2ProT: 4.4,  lfmProT: 75   },
  { key: '15/17', label: '15/17 cm', m2ProT: 2.55, lfmProT: 37.5 },
]

function PflasterCalculator() {
  const [groesse, setGroesse]   = useState(PFLASTER_GROESSEN[0].key)
  const [flaeche, setFlaeche]   = useState('')
  const [laufmeter, setLaufmeter] = useState('')
  const [reserve, setReserve]   = useState(true)

  const g = PFLASTER_GROESSEN.find((x) => x.key === groesse)!

  const result = useMemo(() => {
    const f  = parseFloat(flaeche.replace(',', '.'))   || 0
    const lm = parseFloat(laufmeter.replace(',', '.'))  || 0
    if (f <= 0 && lm <= 0) return null
    const tFlaeche = f  > 0 ? f  / g.m2ProT  : 0
    const tLfm     = lm > 0 ? lm / g.lfmProT : 0
    const basis = (tFlaeche + tLfm) * 1000
    const total = reserve ? basis * 1.08 : basis
    return { total }
  }, [flaeche, laufmeter, g, reserve])

  return (
    <>
      <div className={styles.field}>
        <label>Pflastergröße</label>
        <div className={styles.chipRow}>
          {PFLASTER_GROESSEN.map((s) => (
            <button
              key={s.key} type="button"
              className={`${styles.chip} ${groesse === s.key ? styles.chipActive : ''}`}
              onClick={() => setGroesse(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label>Fläche (m²)</label>
          <input
            type="text" inputMode="decimal" placeholder="optional"
            value={flaeche} onChange={(e) => setFlaeche(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label>Laufmeter (lfm)</label>
          <input
            type="text" inputMode="decimal" placeholder="optional"
            value={laufmeter} onChange={(e) => setLaufmeter(e.target.value)}
          />
        </div>
      </div>
      <label className={styles.checkboxRow}>
        <input type="checkbox" checked={reserve} onChange={(e) => setReserve(e.target.checked)} />
        + 8 % Reserve (Verschnitt, Sortierung)
      </label>

      <div className={styles.result}>
        {result ? (
          <div className={styles.resultTotal}>
            <span>Benötigte Menge</span>
            <strong>{fmtT(result.total)} <small>· {fmtKg(result.total)}</small></strong>
          </div>
        ) : (
          <p className={styles.resultEmpty}>Fläche und/oder Laufmeter eingeben.</p>
        )}
      </div>
      <p className={styles.hint}>Praxiswerte, Ergiebigkeit kann je nach Steinform, Fugenbreite und Verlegeart abweichen.</p>
    </>
  )
}

// ── Trockenmauer — Bedarfsmenge Steine ─────────────────────────────────────
// Fester Richtwert je m² Ansichtsfläche bei ca. 20 cm Steintiefe.
const MAUER_KG_PRO_M2 = 515

function MauerCalculator() {
  const [flaeche, setFlaeche] = useState('')
  const [reserve, setReserve] = useState(true)

  const result = useMemo(() => {
    const f = parseFloat(flaeche.replace(',', '.'))
    if (!f || f <= 0) return null
    const basis = MAUER_KG_PRO_M2 * f
    const total = reserve ? basis * 1.12 : basis
    return { total }
  }, [flaeche, reserve])

  return (
    <>
      <div className={styles.field}>
        <label>Ansichtsfläche (m²)</label>
        <input
          type="text" inputMode="decimal" placeholder="z. B. 8"
          value={flaeche} onChange={(e) => setFlaeche(e.target.value)}
        />
      </div>
      <label className={styles.checkboxRow}>
        <input type="checkbox" checked={reserve} onChange={(e) => setReserve(e.target.checked)} />
        + 12 % Reserve (Verschnitt)
      </label>

      <div className={styles.result}>
        {result ? (
          <>
            <div className={styles.resultRow}>
              <span>Bedarf pro m²</span>
              <span>{fmtKg(MAUER_KG_PRO_M2)}</span>
            </div>
            <div className={styles.resultTotal}>
              <span>Gesamtbedarf</span>
              <strong>{fmtKg(result.total)} <small>· {fmtT(result.total)}</small></strong>
            </div>
          </>
        ) : (
          <p className={styles.resultEmpty}>Ansichtsfläche eingeben, um den Bedarf zu berechnen.</p>
        )}
      </div>
      <p className={styles.hint}>Bezogen auf trocken geschichtetes Mauerwerk ohne Hinterfüllung, ca. 20 cm Steintiefe.</p>
    </>
  )
}

export default function MaterialCalculator() {
  const [tab, setTab] = useState<Tab>('kies')

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key} type="button"
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'kies'     && <KiesCalculator />}
      {tab === 'pflaster' && <PflasterCalculator />}
      {tab === 'mauer'    && <MauerCalculator />}
    </div>
  )
}
