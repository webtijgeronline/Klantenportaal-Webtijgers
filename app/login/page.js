'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'

const ORANGE = '#f97316'
const BEIGE = '#d1c3aa'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (email === 'ryan@webtijger.nl' && password === 'admin') {
        localStorage.setItem('wt_user', JSON.stringify({ role: 'admin', name: 'Ryan', email }))
        router.push('/admin/dashboard')
        return
      }
      const { data, error: err } = await supabase.from('clients').select('*').eq('email', email).eq('password', password).single()
      if (err || !data) { setError('Onjuist e-mailadres of wachtwoord.'); setLoading(false); return }
      localStorage.setItem('wt_user', JSON.stringify({ role: 'client', name: data.name, email: data.email }))
      sessionStorage.setItem('clientEmail', data.email)
      router.push('/portal/project')
    } catch {
      setError('Er is iets misgegaan. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.875rem',
    background: '#fff', border: '1px solid #e5e7eb',
    borderRadius: 9, color: '#111', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* Left: branding panel */}
      <div style={{ display: 'none', flex: 1, background: '#0f0f0f', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', '@media(minWidth:768px)': { display: 'flex' } }}
        className="login-left">
        <Image src="/logo.png" alt="Webtijger" width={200} height={75} style={{ objectFit: 'contain', marginBottom: '2rem' }} />
        <Image src="/mascotte.png" alt="Webtijger mascotte" width={320} height={320} style={{ objectFit: 'contain' }} />
        <p style={{ color: '#555', fontSize: '0.9rem', textAlign: 'center', marginTop: '1.5rem', maxWidth: 260, lineHeight: 1.6 }}>
          Jouw persoonlijke portaal voor projectupdates, bestanden en meer.
        </p>
      </div>

      {/* Right: login form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Image src="/logo.png" alt="Webtijger" width={160} height={60} style={{ objectFit: 'contain' }} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: '0.3rem', color: '#111' }}>Welkom terug</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.75rem' }}>Log in op je Webtijger klantportaal</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#374151', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>E-mailadres</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jouw@email.nl" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#374151', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>Wachtwoord</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.625rem 0.875rem', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', background: ORANGE, color: '#fff', border: 'none', padding: '0.75rem', borderRadius: 9, fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
              {loading ? 'Inloggen...' : 'Inloggen'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '1.5rem' }}>
            Geen account?{' '}
            <a href="mailto:info@webtijger.nl" style={{ color: ORANGE, textDecoration: 'none', fontWeight: 600 }}>Neem contact op</a>
          </p>
        </div>
      </div>
    </div>
  )
}
