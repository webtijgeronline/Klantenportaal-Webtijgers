'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const ORANGE = '#f97316'
const BEIGE = '#d1c3aa'

export default function Sidebar({ navItems, user, basePath }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem('wt_user')
    sessionStorage.removeItem('clientEmail')
    router.push('/login')
  }

  return (
    <aside style={{ width: 220, background: '#0f0f0f', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* Logo */}
      <div style={{ padding: '20px 18px 16px' }}>
        <Image src="/logo.png" alt="Webtijger" width={140} height={52} style={{ objectFit: 'contain', objectPosition: 'left' }} />
        <div style={{ color: '#555', fontSize: 10, letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 4 }}>
          {basePath === '/admin' ? 'Beheerder' : 'Klantportaal'}
        </div>
      </div>

      <div style={{ height: 1, background: '#1a1a1a', margin: '0 0 8px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 10px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const active = pathname === basePath + '/' + item.id || (item.id === 'dashboard' && pathname === basePath)
          return (
            <Link key={item.id} href={basePath + '/' + item.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 8, marginBottom: 2,
                background: active ? ORANGE : 'transparent',
                color: active ? '#ffffff' : '#777',
                fontSize: 13.5, fontWeight: active ? 600 : 400,
                textDecoration: 'none',
              }}>
              {item.label}
              {item.badge > 0 && (
                <span style={{ background: active ? 'rgba(255,255,255,0.3)' : '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>{item.badge}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1c1c1c', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: ORANGE, flexShrink: 0 }}>
            {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#d0d0d0', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Gebruiker'}</div>
            <div style={{ color: '#444', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
          </div>
        </div>
        <button onClick={logout} style={{ marginTop: 10, width: '100%', background: '#1a1a1a', border: 'none', cursor: 'pointer', color: '#555', fontSize: 12, fontFamily: "'DM Sans', sans-serif", padding: '7px', borderRadius: 7 }}>
          Uitloggen
        </button>
      </div>
    </aside>
  )
}
