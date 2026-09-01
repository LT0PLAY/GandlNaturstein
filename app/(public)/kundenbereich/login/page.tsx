export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import LoginForm from './LoginForm'
import { CUSTOMER_SESSION_COOKIE, isValidCustomerSessionToken } from '@/lib/customerSession'

export const metadata: Metadata = {
  title: 'BtoB Login – Gandl Natursteine',
  robots: { index: false, follow: false },
}

export default async function KundenbereichLoginPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value
  if (isValidCustomerSessionToken(token)) redirect('/kundenbereich')

  return (
    <div style={{
      minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        border: '0.5px solid rgba(155,174,159,0.18)', background: 'var(--color-bg-card)',
        padding: '40px 36px',
      }}>
        <p style={{
          fontFamily: 'var(--font-inter)', fontSize: '13px', letterSpacing: '.14em',
          textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '10px',
        }}>
          // Privatbereich
        </p>
        <h1 style={{
          fontFamily: 'var(--font-bebas)', fontSize: '38px', color: '#dcdcd6',
          letterSpacing: '.02em', marginBottom: '8px', lineHeight: 1,
        }}>
          BtoB Login
        </h1>
        <p style={{
          fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#9caea1',
          lineHeight: 1.6, marginBottom: '28px',
        }}>
          Bitte mit den Ihnen mitgeteilten Zugangsdaten anmelden.
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
