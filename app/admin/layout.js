'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'

const ADMIN_NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'clients', label: 'Klanten' },
  { id: 'projects', label: 'Projecten' },
  { id: 'invoices', label: 'Facturen' },
  { id: 'contracts', label: 'Overeenkomsten' },
  { id: 'files', label: 'Bestanden' },
  { id: 'aanleveren', label: 'Aanleveren' },
  { id: 'support', label: 'Support' },
  { id: 'feedback', label: 'Feedback' },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('wt_user')
    if (!stored) { router.push('/login'); return }
    const parsed = JSON.parse(stored)
    if (parsed.role !== 'admin') { router.push('/portal/project'); return }
    setUser(parsed)
  }, [])

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#f9fafb' }}>
      <Sidebar navItems={ADMIN_NAV} user={user} basePath="/admin" />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}
