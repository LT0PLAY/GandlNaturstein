'use client'

import formStyles from '../../form.module.css'

/** Öffnet den Druckdialog des Browsers — dort "Als PDF sichern" wählen, um eine PDF-Datei zu erhalten. */
export default function PrintButton() {
  return (
    <button type="button" className={formStyles.btnPrimary} onClick={() => window.print()}>
      Drucken / als PDF
    </button>
  )
}
