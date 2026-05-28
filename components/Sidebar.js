'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ORANGE = '#f97316'

export default function Sidebar({ navItems, user, basePath }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem('wt_user')
    sessionStorage.removeItem('clientEmail')
    router.push('/login')
  }

  return (
    <aside style={{ width: 220, background: '#f5f5f4', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', fontFamily: "'Poppins', sans-serif" }}>

      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/mascotte.png" alt="Webtijger" style={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }} />
        <div>
          <div style={{ color: '#111', fontSize: 14, fontWeight: 700, letterSpacing: '-0.2px', lineHeight: 1.2 }}>Webtijger</div>
          <div style={{ color: '#aaa', fontSize: 10, letterSpacing: '0.6px', textTransform: 'uppercase', marginTop: 1 }}>
            {basePath === '/admin' ? 'Beheerder' : 'Klantportaal'}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: '#e5e7eb' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const active = pathname === basePath + '/' + item.id || (item.id === 'dashboard' && pathname === basePath)
          return (
            <Link key={item.id} href={basePath + '/' + item.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', borderRadius: 9, marginBottom: 2,
                background: active ? ORANGE : 'transparent',
                color: active ? '#ffffff' : '#555',
                fontSize: 13, fontWeight: active ? 700 : 500,
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
      <div style={{ padding: '12px 14px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#ffe4cc', border: `1.5px solid #fed7aa`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: ORANGE, flexShrink: 0 }}>
            {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#111', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Gebruiker'}</div>
            <div style={{ color: '#aaa', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
          </div>
        </div>
        <button onClick={logout}
          style={{ marginTop: 10, width: '100%', background: '#efefed', border: '1px solid #e5e7eb', cursor: 'pointer', color: '#888', fontSize: 12, fontFamily: "'Poppins', sans-serif", padding: '7px', borderRadius: 7, fontWeight: 500 }}>
          Uitloggen
        </button>
      </div>
    </aside>
  )
}
