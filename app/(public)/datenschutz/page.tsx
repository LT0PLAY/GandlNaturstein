import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = { title: 'Datenschutz – Gandl Natursteine' }

export default function DatenschutzPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Datenschutz&shy;erklärung</h1>

      <div className={styles.body}>

        {/* ── VERANTWORTLICHER ── */}
        <h2>Verantwortlicher im Sinne der DSGVO</h2>
        <p>
          Der Verantwortliche im Sinne der Datenschutzgrundverordnung (DSGVO) und anderer
          nationaler Datenschutzgesetze sowie sonstiger datenschutzrechtlicher Bestimmungen ist:
        </p>
        <p>
          <strong>Rainer Gandl</strong><br />
          GANDL Natursteine GmbH<br />
          Rudolf-Diesel-Ring 6<br />
          82266 Inning am Ammersee<br />
          Telefon: <a href="tel:+4981439974​0">+49 81 43 – 99 74 – 0</a><br />
          E-Mail: <a href="mailto:info@gandl-natursteine.de">info@gandl-natursteine.de</a><br />
          Web: <a href="https://www.gandl-natursteine.de" target="_blank" rel="noopener">www.gandl-natursteine.de</a>
        </p>
        <p>
          Diese Datenschutzerklärung gilt für unsere Website sowie die Datenverarbeitung durch
          die Firmengruppe bestehend aus:
        </p>
        <p>
          <strong>Gandl Natursteine GmbH</strong> · Rudolf-Diesel-Ring 6 · 82266 Inning am Ammersee<br />
          Tel.: 08143 9974-0 · E-Mail: info@gandl-natursteine.de<br />
          <br />
          <strong>Gandl Natursteine GmbH Kirchheim</strong> · Konsul-Metzing-Str. 3 · 97268 Kirchheim<br />
          Tel.: 09366 99 79-7 · E-Mail: info@gandl-kirchheim.de<br />
          <br />
          <strong>Hammerl Baustoffe + Natursteine GmbH</strong> · Rudolf-Diesel-Str. 18 · 86554 Pöttmes<br />
          Tel.: 08253 99 760-0 · E-Mail: info@hammerl-baustoffe.de
        </p>

        <hr />

        {/* ── DATENSCHUTZBEAUFTRAGTER ── */}
        <h2>Datenschutzbeauftragter</h2>
        <p>
          <strong>Herr Salih Erdogan (B.Eng.)</strong><br />
          Datenschutzbeauftragter (hwk)<br />
          Rudolf-Diesel-Ring 6 · 82266 Inning am Ammersee<br />
          Telefon: <a href="tel:+49814399744​8">08143 99 74 – 48</a><br />
          Telefax: +49 81 43 – 99 74 – 13<br />
          E-Mail: <a href="mailto:datenschutz@gandl-natursteine.de">datenschutz@gandl-natursteine.de</a>
        </p>

        <hr />

        {/* ── ALLGEMEINES ── */}
        <h2>Datenschutz</h2>
        <p>
          Sie erhalten als Nutzer unserer Website in dieser Datenschutzerklärung alle notwendigen
          Informationen darüber, wie, in welchem Umfang sowie zu welchem Zweck wir oder
          Drittanbieter Daten von Ihnen erheben und diese verwenden. Die Erhebung und Nutzung
          Ihrer Daten erfolgt streng nach den Vorgaben der europäischen Datenschutzgrundverordnung
          (DSGVO), des Bundesdatenschutzgesetzes (BDSG) und des Digitale-Dienste-Gesetzes (DDG).
        </p>
        <p>
          Wir fühlen uns der Vertraulichkeit Ihrer personenbezogenen Daten besonders verpflichtet
          und arbeiten streng innerhalb der gesetzlichen Grenzen. Die Erhebung personenbezogener
          Daten erfolgt auf freiwilliger Basis, soweit uns das möglich ist. Wir geben diese Daten
          nur mit Ihrer ausdrücklichen Zustimmung an Dritte weiter. Bei besonders vertraulichen
          Daten sorgen wir durch SSL-Verschlüsselung für hohe Sicherheit.
        </p>

        <hr />

        {/* ── HOSTING ── */}
        <h2>Hosting – Vercel Inc.</h2>
        <p>
          Diese Website wird gehostet von der <strong>Vercel Inc.</strong>, 340 Pine Street,
          Suite 701, San Francisco, CA 94104, USA. Vercel ist als Auftragsverarbeiter gemäß
          Art. 28 DSGVO tätig; ein entsprechender Vertrag wurde geschlossen.
        </p>
        <p>
          Beim Aufruf unserer Website werden automatisch folgende Daten in Server-Logfiles erfasst:
        </p>
        <ul>
          <li>IP-Adresse (nach kurzer Zeit anonymisiert)</li>
          <li>Datum und Uhrzeit des Abrufs</li>
          <li>Aufgerufene URL sowie HTTP-Statuscode</li>
          <li>Browser-Typ, Version und Betriebssystem</li>
          <li>Referrer-URL (zuvor besuchte Seite)</li>
        </ul>
        <p>
          Diese Daten sind technisch erforderlich für die Auslieferung der Website und werden nicht
          mit personenbezogenen Daten zusammengeführt. Die Übertragung in die USA erfolgt auf Basis
          von Standardvertragsklauseln gemäß Art. 46 DSGVO.<br />
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am
          sicheren Betrieb der Website).<br />
          Weitere Informationen:{' '}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener">
            vercel.com/legal/privacy-policy
          </a>
        </p>

        <hr />

        {/* ── SSL ── */}
        <h2>SSL-Verschlüsselung</h2>
        <p>
          Unsere Website nutzt SSL-Verschlüsselung (HTTPS) für die Übermittlung vertraulicher
          und persönlicher Inhalte. Eine aktivierte Verschlüsselung erkennen Sie daran, dass
          die Adresszeile im Browser von „http://" auf „https://" wechselt und ein
          Schlosssymbol erscheint. Über SSL verschlüsselte Daten sind für Dritte nicht lesbar.
        </p>

        <hr />

        {/* ── WEBANALYSE ── */}
        <h2>Webanalyse – Vercel Analytics</h2>
        <p>
          Diese Website nutzt <strong>Vercel Analytics</strong>, einen Analysedienst der Vercel
          Inc. Vercel Analytics erfasst anonymisierte Nutzungsdaten (Seitenaufrufe, Ladezeiten,
          Herkunftsland) <strong>ohne Cookies</strong> und ohne personenbezogene Identifikation
          einzelner Nutzer. Es werden keine sitzungsübergreifenden Profile erstellt und keine
          Daten mit anderen Diensten verknüpft.
        </p>
        <p>
          Da ausschließlich anonymisierte, nicht personenbezogene Daten verarbeitet werden, ist
          für diesen Dienst keine Cookie-Einwilligung erforderlich.<br />
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
          an der anonymisierten Websiteoptimierung).<br />
          Weitere Informationen:{' '}
          <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener">
            vercel.com/docs/analytics/privacy-policy
          </a>
        </p>

        <hr />

        {/* ── DATENSPEICHERUNG / SUPABASE ── */}
        <h2>Datenspeicherung – Supabase</h2>
        <p>
          Anfrage- und Formulardaten werden in einer Datenbank bei <strong>Supabase Inc.</strong>{' '}
          gespeichert. Supabase ist Auftragsverarbeiter gemäß Art. 28 DSGVO; ein entsprechender
          Vertrag wurde geschlossen. Die Daten werden in der EU-Region (Frankfurt, Deutschland)
          gespeichert und ausschließlich zur Bearbeitung Ihrer Anfrage verwendet. Eine Weitergabe
          an Dritte findet nicht statt.<br />
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) bzw.
          Art. 6 Abs. 1 lit. f DSGVO.<br />
          Weitere Informationen:{' '}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener">
            supabase.com/privacy
          </a>
        </p>

        <hr />

        {/* ── KONTAKTFORMULARE ── */}
        <h2>Kontakt- und Anfrageformulare</h2>
        <p>
          Wenn Sie uns über Kontaktformulare, den Anfragekorb oder den Callback-Service
          kontaktieren, werden folgende Daten erhoben:
        </p>
        <ul>
          <li>Name (Pflichtfeld)</li>
          <li>E-Mail-Adresse (Pflichtfeld)</li>
          <li>Telefonnummer (optional)</li>
          <li>Nachricht / Anfrage-Details</li>
        </ul>
        <p>
          Diese Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage und für etwaige
          Rückfragen gespeichert. Wir geben diese Daten nicht ohne Ihre Einwilligung an Dritte
          weiter. Die Daten werden gelöscht, sobald die Anfrage abschließend bearbeitet ist und
          keine gesetzlichen Aufbewahrungspflichten entgegenstehen.<br />
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) bzw.
          Art. 6 Abs. 1 lit. f DSGVO.
        </p>

        <h3>E-Mail-Kontakt</h3>
        <p>
          Bei Kontaktaufnahme per E-Mail werden die übermittelten Daten (E-Mail-Adresse, Inhalt,
          Zeitstempel) zur Bearbeitung Ihres Anliegens gespeichert. Unsere E-Mails werden
          ausschließlich SSL/TLS-verschlüsselt versendet. Ist ein Mitarbeiter für Ihr Anliegen
          nicht zuständig, wird Ihre E-Mail intern anonymisiert weitergeleitet; nur wenn externe
          Informationen benötigt werden, erfolgt eine anonymisierte externe Weiterleitung.
        </p>

        <hr />

        {/* ── GOOGLE MAPS ── */}
        <h2>Google Maps</h2>
        <p>
          Auf dieser Website wird <strong>Google Maps</strong> der Google Ireland Limited
          (Gordon House, Barrow Street, Dublin 4, Irland) eingebunden. Google Maps wird
          erst nach Ihrer ausdrücklichen Einwilligung geladen (2-Klick-Lösung). Vor der
          Aktivierung werden keine Daten an Google übermittelt.
        </p>
        <p>
          Nach Aktivierung wird beim Aufruf einer Seite mit Google Maps eine Verbindung zu
          Google-Servern hergestellt; dabei werden u.&nbsp;a. Ihre IP-Adresse und die aufgerufene
          Seite an Google übermittelt. Wenn Sie in Ihrem Google-Konto eingeloggt sind, kann
          Google Ihr Surfverhalten Ihrem Profil zuordnen. Sie können dies verhindern, indem Sie
          sich aus Ihrem Google-Konto ausloggen. Informationen zum Umgang mit Nutzerdaten
          finden Sie in der Datenschutzerklärung von Google:{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">
            policies.google.com/privacy
          </a><br />
          Die Übertragung in die USA erfolgt auf Basis von Standardvertragsklauseln (Art. 46 DSGVO).<br />
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
        </p>
        <p>
          Nutzungsbedingungen Google Maps:{' '}
          <a href="https://www.google.com/intl/de/help/terms_maps.html" target="_blank" rel="noopener">
            google.com/intl/de/help/terms_maps.html
          </a>
        </p>

        <hr />

        {/* ── ZUGRIFFSDATEN ── */}
        <h2>Zugriffsdaten</h2>
        <p>
          Die Auslieferung und Darstellung der Inhalte erfordert technisch die Erfassung
          bestimmter Daten. Mit Ihrem Zugriff auf unsere Website werden diese sogenannten
          Server-Logfiles erfasst. Diese Logfiles erlauben keinen identifizierten Rückschluss
          auf Ihre Person. Wir nutzen diese Daten zur Darstellung und Auslieferung unserer
          Inhalte sowie zu statistischen Zwecken. Wir behalten uns vor, die erwähnten Daten
          nachträglich zu prüfen, sollte der Verdacht auf eine rechtswidrige Nutzung unseres
          Angebotes bestehen.
        </p>

        <hr />

        {/* ── COOKIES ── */}
        <h2>Cookies</h2>
        <p>
          Diese Website verwendet technisch notwendige Cookies zur fehlerfreien Darstellung
          und Nutzung der Website (z.&nbsp;B. für den Anfragekorb). Diese Cookies sind für den
          Betrieb der Website erforderlich und können nicht deaktiviert werden.
        </p>
        <p>
          Darüber hinaus werden nur dann Cookies gesetzt, wenn Sie aktiv eingewilligt haben
          (z.&nbsp;B. für Google Maps). Sie können Cookies in Ihren Browsereinstellungen
          jederzeit deaktivieren, was jedoch die Funktionsfähigkeit der Website einschränken kann.
        </p>

        <hr />

        {/* ── DRITTANBIETER ── */}
        <h2>Externe Links</h2>
        <p>
          Unsere Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir
          keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte keine Gewähr
          übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
          verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf
          mögliche Rechtsverstöße überprüft. Bei Bekanntwerden von Rechtsverletzungen
          werden wir derartige Links umgehend entfernen.
        </p>

        <hr />

        {/* ── AUSKUNFT / LÖSCHUNG ── */}
        <h2>Auskunft, Berichtigung, Sperrung, Löschung</h2>
        <p>
          Sie erhalten jederzeit unentgeltlich Auskunft über die von uns gespeicherten
          personenbezogenen Daten sowie zur Herkunft, dem Empfänger und dem Zweck von
          Datenerhebung und -verarbeitung. Außerdem haben Sie das Recht auf Berichtigung,
          Sperrung oder Löschung Ihrer Daten — ausgenommen Daten, die aufgrund gesetzlicher
          Vorschriften aufbewahrt oder zur ordnungsgemäßen Geschäftsabwicklung benötigt werden.
        </p>
        <p>
          Für alle Fragen zur Berichtigung, Sperrung oder Löschung wenden Sie sich an unseren
          Datenschutzbeauftragten:{' '}
          <a href="mailto:datenschutz@gandl-natursteine.de">datenschutz@gandl-natursteine.de</a>
        </p>

        <hr />

        {/* ── BETROFFENENRECHTE ── */}
        <h2>Ihre Rechte (Art. 15 – 22 DSGVO)</h2>
        <ul>
          <li><strong>Auskunft</strong> (Art. 15): Welche Daten von Ihnen gespeichert sind</li>
          <li><strong>Berichtigung</strong> (Art. 16): Korrektur unrichtiger Daten</li>
          <li><strong>Löschung</strong> (Art. 17): Löschen Ihrer Daten, soweit keine Aufbewahrungspflicht</li>
          <li><strong>Einschränkung</strong> (Art. 18): Eingeschränkte Verarbeitung Ihrer Daten</li>
          <li><strong>Datenübertragbarkeit</strong> (Art. 20): Herausgabe in maschinenlesbarem Format</li>
          <li><strong>Widerspruch</strong> (Art. 21): Gegen Verarbeitung auf Basis berechtigter Interessen</li>
          <li><strong>Widerruf</strong> (Art. 7 Abs. 3): Erteilte Einwilligungen jederzeit mit Wirkung für die Zukunft</li>
        </ul>

        <h3>Widerspruchsrecht nach Art. 21 DSGVO</h3>
        <p>
          Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
          jederzeit gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen.
          Machen Sie von Ihrem Widerspruchsrecht Gebrauch, so werden Ihre Daten nicht mehr
          verarbeitet, es sei denn, wir können zwingende schutzwürdige Gründe für die
          Verarbeitung nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen, oder
          die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.
        </p>
        <p>
          Bitte wenden Sie sich hierzu an den Datenschutzbeauftragten:{' '}
          <a href="mailto:datenschutz@gandl-natursteine.de">datenschutz@gandl-natursteine.de</a>
        </p>

        <hr />

        {/* ── AUFSICHTSBEHÖRDE ── */}
        <h2>Beschwerderecht bei einer Aufsichtsbehörde</h2>
        <p>
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren,
          wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen
          geltendes Recht verstößt. Zuständige Aufsichtsbehörde für nichtöffentliche Stellen
          in Bayern:{' '}
          <a href="https://www.lda.bayern.de" target="_blank" rel="noopener">
            Bayerisches Landesamt für Datenschutzaufsicht (BayLDA), Ansbach
          </a>
        </p>

        <hr />

        {/* ── ÄNDERUNGEN ── */}
        <h2>Änderungen dieser Datenschutzerklärung</h2>
        <p>
          Um zu gewährleisten, dass unsere Datenschutzerklärung stets den aktuellen gesetzlichen
          Vorgaben entspricht, behalten wir uns jederzeit Änderungen vor. Das gilt auch für den
          Fall, dass die Datenschutzerklärung aufgrund neuer oder überarbeiteter Leistungen
          angepasst werden muss. Die neue Datenschutzerklärung greift dann bei Ihrem nächsten
          Besuch auf unserem Angebot.
        </p>

        <hr />
        <p style={{ fontSize: '11px' }}>Stand: {new Date().getFullYear()}</p>

      </div>
    </div>
  )
}
