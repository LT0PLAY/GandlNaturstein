import NavWrapper from '@/components/Navbar/NavWrapper'
import Footer from '@/components/Footer/Footer'
import { BasketProvider } from '@/components/public/BasketContext'
import BasketDrawer from '@/components/public/BasketDrawer'
import BasketButton from '@/components/public/BasketButton'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <BasketProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavWrapper />
        <main style={{ flex: 1, paddingTop: '72px' }}>
          {children}
        </main>
        <Footer />
        <BasketButton />
        <BasketDrawer />
      </div>
    </BasketProvider>
  )
}
