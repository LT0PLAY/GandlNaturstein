import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = { title: 'Widerrufsrecht – Gandl Natursteine' }

export default function WiderrufsrechtPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Widerrufsrecht &amp; Widerrufsformular</h1>

      <div className={styles.body}>
        <h2>Widerrufsbelehrung</h2>

        <h3>Widerrufsrecht</h3>
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag
          zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder
          ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz
          genommen haben bzw. hat.
        </p>
        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns —
        </p>
        <p>
          <strong>GANDL Natursteine GmbH</strong><br />
          Rudolf-Diesel-Ring 6<br />
          82266 Inning am Ammersee<br />
          Telefon: <a href="tel:+4981439974​0">+49 81 43 – 99 74 – 0</a><br />
          Telefax: +49 81 43 – 99 74 – 13<br />
          E-Mail: <a href="mailto:info@gandl-natursteine.de">info@gandl-natursteine.de</a>
        </p>
        <p>
          — mittels einer eindeutigen Erklärung (z.&nbsp;B. ein mit der Post versandter Brief,
          Telefax oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
          Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht
          vorgeschrieben ist.
        </p>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die
          Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
        </p>

        <h3>Folgen des Widerrufs</h3>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von
          Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen
          Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von
          uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und
          spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung
          über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung
          verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion
          eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart;
          in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
        </p>
        <p>
          Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben
          oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben,
          je nachdem, welches der frühere Zeitpunkt ist.
        </p>
        <p>
          Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen
          ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns
          zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor
          Ablauf der Frist von vierzehn Tagen absenden.
        </p>
        <p>
          Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.
        </p>
        <p>
          Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser
          Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und
          Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.
        </p>

        <h3>Ausschluss des Widerrufsrechts</h3>
        <p>
          Das Widerrufsrecht besteht nicht bei Waren, die nach Kundenspezifikation angefertigt
          wurden oder eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten
          sind (§ 312g Abs. 2 Nr. 1 BGB). Dies betrifft insbesondere Natursteine, die auf
          Maß geschnitten, bearbeitet oder individuell zusammengestellt wurden.
        </p>

        <hr />

        <h2>Muster-Widerrufsformular</h2>
        <p>
          (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus
          und senden Sie es zurück.)
        </p>

        <div style={{
          border: '0.5px solid rgba(196,146,58,0.2)',
          padding: '24px 28px',
          marginTop: '16px',
          marginBottom: '24px',
        }}>
          <p>
            An:<br />
            <strong>GANDL Natursteine GmbH</strong><br />
            Rudolf-Diesel-Ring 6<br />
            82266 Inning am Ammersee<br />
            E-Mail: info@gandl-natursteine.de
          </p>
          <p>
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über
            den Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*)
          </p>
          <p>
            Bestellt am (*) ____________ / erhalten am (*) ____________
          </p>
          <p>Name des/der Verbraucher(s): ____________</p>
          <p>Anschrift des/der Verbraucher(s): ____________</p>
          <p>
            Unterschrift des/der Verbraucher(s)<br />
            (nur bei Mitteilung auf Papier): ____________
          </p>
          <p>Datum: ____________</p>
          <p style={{ fontSize: '11px', marginTop: '16px', color: 'rgba(200,206,198,0.5)' }}>
            (*) Unzutreffendes streichen.
          </p>
        </div>

        <hr />
        <p style={{ fontSize: '11px' }}>Stand: {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
