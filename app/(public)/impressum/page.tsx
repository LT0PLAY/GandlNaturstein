export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = { title: 'Impressum – Gandl Natursteine' }

export default function ImpressumPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Impressum</h1>

      <div className={styles.body}>

        <h2>Angaben gemäß §§ 5, 6 DDG</h2>
        <p>
          <strong>GANDL Natursteine GmbH</strong><br />
          Rudolf-Diesel-Ring 6<br />
          82266 Inning am Ammersee<br />
          Deutschland
        </p>

        <h2>Kontakt</h2>
        <p>
          Telefon: <a href="tel:+4981439974​0">+49 81 43 – 99 74 – 0</a><br />
          Telefax: +49 81 43 – 99 74 – 13<br />
          E-Mail: <a href="mailto:info@gandl-natursteine.de">info@gandl-natursteine.de</a><br />
          Internet: <a href="https://www.gandl-natursteine.de" target="_blank" rel="noopener">www.gandl-natursteine.de</a>
        </p>

        <h2>Filiale Kaisheim</h2>
        <p>
          Gewerbepark 11<br />
          86687 Kaisheim<br />
          Telefon: <a href="tel:+49909966910">09099 – 96 69 10</a>
        </p>

        <h2>Handelsregister</h2>
        <p>
          Registergericht: Amtsgericht München<br />
          Registernummer: HRB 124293
        </p>

        <h2>Umsatzsteuer-ID</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG:<br />
          DE 128125099<br />
          Zuständiges Finanzamt: Fürstenfeldbruck
        </p>

        <h2>Geschäftsführung</h2>
        <p>Rainer Gandl, Nicole Gandl</p>

        <h2>Inhaltlich verantwortliche Person (§§ 5, 6 DDG)</h2>
        <p>
          Rainer Gandl<br />
          Rudolf-Diesel-Ring 6<br />
          82266 Inning am Ammersee
        </p>

        <hr />

        <h2>Technische Umsetzung</h2>
        <p>
          Diese Website wurde erstellt von:<br />
          <strong>Andreas Wallner</strong><br />
          <a href="https://www.munichmotions.com" target="_blank" rel="noopener">
            www.munichmotions.com
          </a>
        </p>

        <h2>Hosting</h2>
        <p>
          Diese Website wird gehostet von:<br />
          <strong>Vercel Inc.</strong>, 340 Pine Street, Suite 701, San Francisco, CA 94104, USA<br />
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener">
            vercel.com/legal/privacy-policy
          </a><br />
          Beim Aufruf dieser Website werden technische Verbindungsdaten an Vercel übermittelt.
          Weitere Informationen finden Sie in unserer{' '}
          <a href="/datenschutz">Datenschutzerklärung</a>.
        </p>

        <hr />

        <h2>Haftung für Inhalte</h2>
        <p>
          Wir sind ausschließlich für eigene Inhalte auf diesen Seiten nach den allgemeinen
          Gesetzen verantwortlich. Fremde Inhalte werden nicht auf Rechtswidrigkeit überprüft.
          Wir übernehmen für fremde Seiten und Inhalte und auf die Verweise darauf keine Haftung.
        </p>

        <h2>Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
          Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
          Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
          Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
          mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
          Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten
          ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
          Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </p>

        <h2>Urheberrecht</h2>
        <p>
          Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung der Inhalte
          außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung.
          Soweit die Inhalte auf dieser Seite nicht von uns erstellt wurden, werden die
          Urheberrechte Dritter beachtet.
        </p>

        <h2>Streitbeilegung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener">
            http://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p>
          An Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle nehmen wir
          nicht teil.
        </p>

      </div>
    </div>
  )
}
