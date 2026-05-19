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
    <aside style={{ width: 224, background: BEIGE, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Logo */}
      <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Image src="/mascotte.png" alt="Webtijger" width={38} height={38} style={{ objectFit: 'contain', flexShrink: 0 }} />
        <div>
          <div style={{ color: '#2a1f14', fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.2 }}>Webtijger</div>
          <div style={{ color: '#8a7a66', fontSize: 10, letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 1 }}>
            {basePath === '/admin' ? 'Beheerder' : 'Klantportaal'}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: '#c4b49a', margin: '0 0 6px' }} />

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
                color: active ? '#ffffff' : '#5a4a38',
                fontSize: 13.5, fontWeight: active ? 700 : 500,
                textDecoration: 'none',
              }}>
              {item.label}
              {item.badge > 0 && (
                <span style={{ background: active ? 'rgba(255,255,255,0.25)' : '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>{item.badge}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #c4b49a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#c4b49a', border: '1.5px solid #b0a090', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#5a4a38', flexShrink: 0 }}>
            {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#2a1f14', fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Gebruiker'}</div>
            <div style={{ color: '#8a7a66', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
          </div>
        </div>
        <button onClick={logout}
          style={{ marginTop: 10, width: '100%', background: '#c4b49a', border: '1px solid #b0a090', cursor: 'pointer', color: '#5a4a38', fontSize: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '7px', borderRadius: 7, fontWeight: 600 }}>
          Uitloggen
        </button>
      </div>
    </aside>
  )
}
