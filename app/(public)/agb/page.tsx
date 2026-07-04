export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import styles from '../legal.module.css'

export const metadata: Metadata = { title: 'AGB – Gandl Natursteine' }

export default function AgbPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Allgemeine Geschäfts&shy;bedingungen</h1>

      <div className={styles.infoBox}>
        <p>
          <strong>GANDL Natursteine GmbH</strong> · Rudolf-Diesel-Ring 6 · 82266 Inning am Ammersee<br />
          Tel.: <a href="tel:+4981439974​0">+49 81 43 – 99 74 – 0</a> ·{' '}
          <a href="mailto:info@gandl-natursteine.de">info@gandl-natursteine.de</a>
        </p>
      </div>

      <div className={styles.body}>

        <h2>§ 1 Allgemeines und Geltungsbereich</h2>
        <p>
          Unsere Bedingungen gelten für alle Geschäftsbeziehungen zwischen uns und dem Kunden.
          Abweichende, entgegenstehende oder ergänzende Geschäftsbedingungen des Kunden werden
          selbst bei Kenntnis nicht Vertragsbestandteil, es sei denn, dass wir ihrer Geltung
          ausdrücklich schriftlich zustimmen. Kunde im Sinne unserer Bedingungen sind sowohl
          Verbraucher (§ 13 BGB) als auch Unternehmer (§ 14 BGB).
        </p>

        <h2>§ 2 Vertragsschluss</h2>
        <p>
          Unsere Angebote sind freibleibend und unverbindlich. Mit der Bestellung erklärt der
          Kunde verbindlich sein Vertragsangebot. Wir können dieses Angebot nach unserer Wahl
          innerhalb von drei Wochen durch Zusendung einer Auftragsbestätigung oder dadurch
          annehmen, dass wir innerhalb dieser Frist leisten. Der Vertragsschluss erfolgt unter
          dem Vorbehalt, im Falle nicht richtiger oder nicht ordnungsgemäßer Selbstbelieferung
          nicht oder nur teilweise zu leisten. Im Falle der Nichtverfügbarkeit oder nur
          teilweisen Verfügbarkeit der Leistung wird der Kunde unverzüglich informiert.
          Eine bereits erbrachte Gegenleistung wird unverzüglich zurückerstattet.
        </p>

        <h2>§ 3 Vergütung</h2>
        <p>
          Unsere Preise verstehen sich zuzüglich Mehrwertsteuer und gelten ab unserem
          Verkaufslager, wenn sich aus unserer Auftragsbestätigung nichts anderes ergibt.
          Ist eine Lieferung frei Baustelle vereinbart, muss die Baustelle risikolos mit
          LKW-Zug angefahren werden können.
        </p>
        <p>
          Wir behalten uns das Recht vor, bei Verträgen mit einer vereinbarten Lieferzeit
          von mehr als vier Monaten die Preise entsprechend den eingetretenen Kostensteigerungen
          aufgrund von Tarifverträgen oder Materialpreissteigerungen zu erhöhen. Beträgt die
          Erhöhung mehr als 5 % des vereinbarten Preises, hat der Kunde ein Kündigungsrecht.
        </p>
        <p>
          Aufrechnungsrechte stehen dem Kunden nur zu, wenn seine Gegenansprüche rechtskräftig
          festgestellt oder von uns anerkannt sind. Wir können Vorauszahlung verlangen, wenn es
          sich um einen Neukunden handelt oder wenn die Erfüllung unseres Zahlungsanspruches
          wegen einer nach Vertragsschluss bekannt gewordenen Verschlechterung der
          Vermögensverhältnisse des Kunden gefährdet ist.
        </p>
        <p>
          Im Übrigen ist der Kunde zur Zahlung des Preises spätestens zehn Tage nach Erhalt
          der Leistung verpflichtet. Nach Ablauf dieser Frist kommt er in Zahlungsverzug.
          Gegenüber einem Unternehmer behalten wir uns vor, einen höheren als den gesetzlichen
          Verzugszinsschaden nachzuweisen und geltend zu machen. Die Annahme von Schecks oder
          Wechseln erfolgt nur erfüllungshalber. Gebühren und ähnliche Unkosten gehen zu
          Lasten des Kunden.
        </p>

        <h2>§ 4 Gewährleistung</h2>
        <p>
          Für Art und Umfang der Lieferung ist in jedem Falle unsere Auftragsbestätigung
          maßgebend. Muster gelten nur als annähernd, da sie das zu liefernde Material
          niemals präzise charakterisieren können. Farbliche Schwankungen bei Natursteinen
          sind normal und stellen keinen Reklamationsgrund dar. Bei Lieferung von gebrauchtem
          Material sind Schmutzanteile bis 5 % erlaubt, ohne dass Gewichtsabzüge vorgenommen
          werden können.
        </p>
        <p>
          Bei Unternehmern leisten wir für Mängel der Ware zunächst nach unserer Wahl Gewähr
          durch Nachbesserung oder Ersatzlieferung. Schlägt die Nacherfüllung fehl, kann der
          Kunde grundsätzlich nach seiner Wahl Herabsetzung der Vergütung, Rückgängigmachung
          des Vertrages oder Schadensersatz statt der Leistung verlangen. Bei nur geringfügigen
          Mängeln steht dem Kunden das Recht der Rückgängigmachung des Vertrages nicht zu.
        </p>
        <p>
          Unternehmer müssen offensichtliche Mängel unverzüglich — jedenfalls vor
          Weiterverarbeitung oder Einbau — schriftlich anzeigen. Andernfalls ist die
          Geltendmachung des Gewährleistungsanspruches ausgeschlossen.
        </p>
        <p>
          Die Gewährleistungsfrist beträgt bei der Lieferung neu hergestellter Sachen für
          Verbraucher zwei Jahre und für Unternehmer ein Jahr ab Gefahrübergang. Bei
          gebrauchten Sachen beträgt die Gewährleistungsfrist für Verbraucher ein Jahr ab
          Gefahrübergang; bei Unternehmern ist die Gewährleistung für gebrauchte Sachen
          ausgeschlossen.
        </p>

        <h2>§ 5 Eigentumsvorbehalt</h2>
        <p>
          Bei Verbrauchern behalten wir uns das Eigentum an der Ware bis zur vollständigen
          Zahlung des Kaufpreises vor.
        </p>
        <p>
          Bei Unternehmern behalten wir uns das Eigentum an der Ware bis zur vollständigen
          Begleichung aller Forderungen aus einer laufenden Kontokorrent- bzw.
          Geschäftsbeziehung vor. Der Unternehmer ist zur Weiteräußerung, Weiterverarbeitung
          oder zum Einbau der Vorbehaltsware nur unter den nachfolgend aufgeführten
          Bestimmungen berechtigt. Die Befugnisse enden mit unserem Widerruf infolge einer
          nachhaltigen Verschlechterung der Vermögenslage, spätestens jedoch mit seiner
          Zahlungseinstellung oder mit der Beantragung bzw. Eröffnung des Insolvenzverfahrens.
        </p>
        <p>
          Übersteigt der Wert der für uns bestehenden Sicherheit unsere gesamten Forderungen
          um mehr als 20 %, sind wir auf Verlangen des Unternehmers zur Freigabe von
          Sicherheiten nach unserer Wahl verpflichtet. Verpfändungen oder
          Sicherungsübereignungen der Vorbehaltsware sind unzulässig. Von Pfändungen sind
          wir unter Angabe des Pfandgläubigers sofort zu benachrichtigen.
        </p>
        <p>
          Nehmen wir aufgrund des Eigentumsvorbehaltes den Liefergegenstand zurück, liegt
          nur dann ein Rücktritt vom Vertrag vor, wenn wir dies ausdrücklich erklären.
          Wir können uns aus der zurückgenommenen Vorbehaltsware durch freihändigen Verkauf
          befriedigen.
        </p>

        <h2>§ 6 Haftungsbeschränkungen</h2>
        <p>
          Bei leicht fahrlässigen Pflichtverletzungen beschränkt sich unsere Haftung auf den
          vorhersehbaren, vertragstypischen, unmittelbaren Durchschnittsschaden. Dies gilt
          auch bei leicht fahrlässigen Pflichtverletzungen unserer gesetzlichen Vertreter
          oder Erfüllungsgehilfen. Gegenüber Unternehmern haften wir bei leicht fahrlässiger
          Verletzung unwesentlicher Vertragspflichten nicht.
        </p>
        <p>
          Die vorstehenden Haftungsbeschränkungen berühren nicht Ansprüche des Kunden aus
          Produkthaftung. Weiter gelten die Haftungsbeschränkungen nicht bei uns
          zurechenbaren Körper- und Gesundheitsschäden oder bei Verlust des Lebens des
          Kunden.
        </p>

        <h2>§ 7 Widerrufsrecht (Verbraucher)</h2>
        <p>
          Verbraucher haben ein gesetzliches Widerrufsrecht. Die ausführliche
          Widerrufsbelehrung sowie das Muster-Widerrufsformular finden Sie unter{' '}
          <a href="/widerrufsrecht">Widerrufsrecht &amp; Widerrufsformular</a>.
          Das Widerrufsrecht besteht nicht bei Waren, die nach Kundenspezifikation
          angefertigt wurden (§ 312g Abs. 2 Nr. 1 BGB).
        </p>

        <h2>§ 8 Datenschutz</h2>
        <p>
          Im Rahmen der Vertragsabwicklung werden personenbezogene Daten des Kunden
          verarbeitet. Einzelheiten zur Art, Umfang und Zweck der Datenverarbeitung sowie
          zu den Rechten der betroffenen Personen entnehmen Sie unserer{' '}
          <a href="/datenschutz">Datenschutzerklärung</a>.
        </p>

        <h2>§ 9 Schlussbestimmungen</h2>
        <p>
          Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder
          öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand für alle
          Streitigkeiten aus diesem Vertrag unser Geschäftssitz (82266 Inning am Ammersee).
        </p>
        <p>
          Sämtliche vertragliche Vereinbarungen bedürfen der Schriftform. Die Änderung dieser
          Klausel bedarf ebenfalls der Schriftform.
        </p>
        <p>
          Die Unwirksamkeit einzelner Bestimmungen des Vertrages einschließlich dieser
          Geschäftsbedingungen berührt nicht die Gültigkeit der übrigen Bestimmungen.
          Die unwirksame Regelung soll durch eine Regelung ersetzt werden, deren
          wirtschaftlicher Erfolg dem der unwirksamen möglichst nahe kommt.
        </p>
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
        </p>

        <hr />
        <p style={{ fontSize: '11px' }}>Stand: {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
