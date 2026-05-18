'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const T = {
  sidebar: '#0f0f0f', sidebarBorder: '#1f1f1f',
  font: "'DM Sans', -apple-system, sans-serif",
}

export default function Sidebar({ navItems, user, basePath }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem('wt_user')
    router.push('/login')
  }

  return (
    <aside style={{ width: 210, background: T.sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', fontFamily: T.font }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: `1px solid ${T.sidebarBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L3 7.5l9 4.5 9-4.5L12 3zM3 16.5l9 4.5 9-4.5M3 12l9 4.5 9-4.5" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ color: '#f0f0f0', fontWeight: 600, fontSize: 13, letterSpacing: '-0.3px' }}>Webtijger</div>
            <div style={{ color: '#3d3d3d', fontSize: 10, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {basePath === '/admin' ? 'CRM' : 'Klantportaal'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px' }}>
        {navItems.map(item => {
          const active = pathname === `${basePath}/${item.id}` || (item.id === 'dashboard' && pathname === basePath)
          return (
            <Link key={item.id} href={`${basePath}/${item.id}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 7, marginBottom: 1, background: active ? '#1c1c1c' : 'transparent', color: active ? '#f0f0f0' : '#5a5a5a', fontSize: 13, fontWeight: active ? 500 : 400, textDecoration: 'none', letterSpacing: '-0.1px' }}>
              {item.label}
              {item.badge > 0 && (
                <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99 }}>{item.badge}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.sidebarBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1c1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#5a5a5a', flexShrink: 0 }}>
              {(user?.name || 'U').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#c0c0c0', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Gebruiker'}</div>
              <div style={{ color: '#3d3d3d', fontSize: 10 }}>{basePath === '/admin' ? 'Beheerder' : 'Klant'}</div>
            </div>
          </div>
          <button onClick={logout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3d3d3d', fontSize: 11, fontFamily: T.font, flexShrink: 0, padding: '4px 6px', borderRadius: 5 }}
            onMouseEnter={e => e.currentTarget.style.color = '#c0c0c0'}
            onMouseLeave={e => e.currentTarget.style.color = '#3d3d3d'}>
            Uitloggen
          </button>
        </div>
      </div>
    </aside>
  )
}
