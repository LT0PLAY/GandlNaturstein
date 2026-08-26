import { getActivePopup } from '@/lib/actions/popups'
import NewsPopupModal from './NewsPopupModal'

// Server-Komponente: holt das aktuell aktive Popup (falls vorhanden) und
// übergibt es an das Client-Modal, das Anzeige/Ausblenden übernimmt.
export default async function NewsPopup() {
  const popup = await getActivePopup()
  if (!popup) return null

  return <NewsPopupModal popup={popup} />
}
