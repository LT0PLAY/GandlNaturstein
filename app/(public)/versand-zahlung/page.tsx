import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = { title: 'Versand & Zahlung – Gandl Natursteine' }

export default function VersandZahlungPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Versand- &amp; Zahlungs&shy;bedingungen</h1>

      <div className={styles.infoBox}>
        <p>
          <strong>GANDL Natursteine GmbH</strong> · Rudolf-Diesel-Ring 6 · 82266 Inning am Ammersee<br />
          Tel.: <a href="tel:+4981439974​0">+49 81 43 – 99 74 – 0</a> ·{' '}
          <a href="mailto:info@gandl-natursteine.de">info@gandl-natursteine.de</a>
        </p>
      </div>

      <div className={styles.body}>

        <h2>1. Liefergebiet</h2>
        <p>
          Wir liefern innerhalb Deutschlands sowie nach Österreich und in die Schweiz.
          Für Lieferungen in andere Länder nehmen Sie bitte vor der Bestellung Kontakt mit uns auf.
        </p>

        <h2>2. Lieferzeiten</h2>
        <p>
          Die jeweiligen Lieferzeiten werden im individuellen Angebot angegeben und richten sich
          nach Verfügbarkeit, Produktart und Menge. Typische Lieferzeiten für Lagerware betragen
          5 – 10 Werktage. Bei Sonderanfertigungen und maßgefertigten Produkten werden
          Lieferzeiten individuell vereinbart.
        </p>
        <p>
          Der Vertragsschluss erfolgt unter dem Vorbehalt, im Falle nicht richtiger oder nicht
          ordnungsgemäßer Selbstbelieferung nicht oder nur teilweise zu leisten. Im Falle der
          Nichtverfügbarkeit oder nur teilweisen Verfügbarkeit der Leistung wird der Kunde
          unverzüglich informiert; eine bereits erbrachte Gegenleistung wird unverzüglich
          zurückerstattet.
        </p>

        <h2>3. Versand und Lieferung</h2>
        <p>
          Natursteinprodukte werden als Speditionsware versandt. Die Versandkosten werden im
          Angebot individuell kalkuliert und sind abhängig von Gewicht, Volumen, Lieferadresse
          und gewählter Lieferart. Auf Anfrage erstellen wir Ihnen ein unverbindliches
          Versandkostenangebot.
        </p>
        <p>
          Bei Lieferung per Spedition erfolgt die Anlieferung frei Bordsteinkante, sofern nicht
          ausdrücklich etwas anderes vereinbart wurde. Die Baustelle bzw. Lieferadresse muss
          risikolos mit LKW-Zug angefahren werden können; ein ausreichend befahrbarer Zugang
          muss seitens des Kunden gewährleistet werden.
        </p>
        <p>
          Weitere Informationen zur Beladung:{' '}
          <a href="https://www.gandl-natursteine.de/info/informationen-zur-beladung.html"
            target="_blank" rel="noopener">
            Infos zur Beladung
          </a>
        </p>

        <h2>4. Selbstabholung</h2>
        <p>
          Selbstabholung ist nach vorheriger Absprache möglich:
        </p>
        <p>
          <strong>GANDL Natursteine GmbH – Inning</strong><br />
          Rudolf-Diesel-Ring 6 · 82266 Inning am Ammersee<br />
          Abholung Mo – Fr bis 16:45 Uhr
        </p>
        <p>
          <strong>Filiale Kaisheim</strong><br />
          Gewerbepark 11 · 86687 Kaisheim · Tel.: 09099 – 96 69 10<br />
          (Öffnungszeiten laut Google-Eintrag)
        </p>

        <h2>5. Transportschäden</h2>
        <p>
          Bitte prüfen Sie die gelieferte Ware bei Annahme auf sichtbare Schäden. Offensichtliche
          Transportschäden sind unmittelbar beim Fahrer zu vermerken und uns unverzüglich zu
          melden. Unternehmer müssen offensichtliche Mängel unverzüglich — jedenfalls vor
          Weiterverarbeitung oder Einbau — schriftlich anzeigen; andernfalls ist die Geltendmachung
          des Gewährleistungsanspruches ausgeschlossen.
        </p>

        <hr />

        <h2>6. Preise</h2>
        <p>
          Unsere Preise verstehen sich zuzüglich der gesetzlichen Mehrwertsteuer und gelten ab
          unserem Verkaufslager, wenn sich aus der Auftragsbestätigung nichts anderes ergibt.
          Preisangaben auf Anfrage erfolgen individuell je nach Produkt, Menge und
          Bearbeitungswunsch.
        </p>
        <p>
          Wir behalten uns das Recht vor, bei Verträgen mit einer vereinbarten Lieferzeit von
          mehr als vier Monaten die Preise entsprechend eingetretenen Kostensteigerungen
          (Tarifverträge, Materialpreise) zu erhöhen. Beträgt die Erhöhung mehr als 5 % des
          vereinbarten Preises, hat der Kunde ein Kündigungsrecht.
        </p>

        <h2>7. Zahlung</h2>
        <p>
          Der Kunde ist zur Zahlung des Preises spätestens zehn Tage nach Erhalt der Leistung
          verpflichtet. Nach Ablauf dieser Frist kommt er in Zahlungsverzug. Gegenüber
          Unternehmern behalten wir uns vor, einen höheren als den gesetzlichen Verzugszinsschaden
          geltend zu machen.
        </p>
        <p>
          Wir können Vorauszahlung verlangen, wenn es sich um einen Neukunden handelt oder wenn
          die Erfüllung unseres Zahlungsanspruches wegen einer nach Vertragsschluss bekannt
          gewordenen Verschlechterung der Vermögensverhältnisse des Kunden gefährdet ist.
        </p>

        <h3>Vorkasse / Überweisung</h3>
        <p>
          Zahlung per Banküberweisung vor Lieferung. Die Bankverbindung wird im Angebot
          mitgeteilt. Die Ware wird nach Zahlungseingang reserviert und versandt.
        </p>

        <h3>Rechnung</h3>
        <p>
          Für Firmenkunden und Gewerbetreibende ist Zahlung auf Rechnung nach vorheriger
          Absprache möglich. Zahlungsziel: 10 Tage netto ab Erhalt der Leistung, sofern
          nicht anders vereinbart.
        </p>

        <h3>Barzahlung bei Abholung</h3>
        <p>
          Bei Selbstabholung ist Barzahlung möglich. Bitte informieren Sie uns vorab über
          Ihre Zahlungsart. Die Annahme von Schecks oder Wechseln erfolgt nur erfüllungshalber;
          Gebühren und ähnliche Unkosten gehen zu Lasten des Kunden.
        </p>

        <h2>8. Aufrechnungsrechte</h2>
        <p>
          Aufrechnungsrechte stehen dem Kunden nur zu, wenn seine Gegenansprüche rechtskräftig
          festgestellt oder von uns anerkannt sind.
        </p>

        <hr />
        <p style={{ fontSize: '11px' }}>Stand: {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
