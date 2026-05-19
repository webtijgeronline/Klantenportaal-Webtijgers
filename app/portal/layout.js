'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'

const PORTAL_NAV = [
  { id: 'project', label: 'Mijn project' },
  { id: 'aanleveren', label: 'Aanleveren' },
  { id: 'contracts', label: 'Overeenkomst' },
  { id: 'files', label: 'Bestanden' },
  { id: 'support', label: 'Support' },
  { id: 'feedback', label: 'Feedback' },
]

export default function PortalLayout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('wt_user')
    if (!stored) { router.push('/login'); return }
    const parsed = JSON.parse(stored)
    if (parsed.role !== 'client') { router.push('/admin/dashboard'); return }
    if (parsed.email) sessionStorage.setItem('clientEmail', parsed.email)
    setUser(parsed)
  }, [])

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#faf9f7' }}>
      <Sidebar navItems={PORTAL_NAV} user={user} basePath="/portal" />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}
