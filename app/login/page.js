'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const ORANGE = '#f97316'

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

      const { data, error: err } = await supabase
        .from('clients')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single()

      if (err || !data) {
        setError('Onjuist e-mailadres of wachtwoord.')
        setLoading(false)
        return
      }

      localStorage.setItem('wt_user', JSON.stringify({ role: 'client', name: data.name, email: data.email }))
      sessionStorage.setItem('clientEmail', data.email)
      router.push('/portal/project')
    } catch {
      setError('Er is iets misgegaan. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', -apple-system, sans-serif", padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: ORANGE, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 5 5 5 9c0 2 1 4 2.5 5.5L6 20h12l-1.5-5.5C18 13 19 11 19 9c0-4-3-7-7-7z" fill="white" opacity="0.9"/>
              <circle cx="9.5" cy="9" r="1" fill="#0f0f0f"/>
              <circle cx="14.5" cy="9" r="1" fill="#0f0f0f"/>
              <path d="M10 13c0 0 1 1.5 2 1.5s2-1.5 2-1.5" stroke="#0f0f0f" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Webtijger</h1>
          <p style={{ color: '#555', fontSize: '0.875rem', marginTop: '0.25rem' }}>Klantportaal</p>
        </div>

        {/* Card */}
        <div style={{ background: '#161616', border: '1px solid #222', borderRadius: 16, padding: '2rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '-0.3px' }}>Inloggen</h2>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#888', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 500 }}>E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jouw@email.nl"
                required
                style={{ width: '100%', padding: '0.65rem 0.875rem', background: '#1f1f1f', border: '1px solid #2a2a2a', borderRadius: 9, color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#888', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 500 }}>Wachtwoord</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '0.65rem 0.875rem', background: '#1f1f1f', border: '1px solid #2a2a2a', borderRadius: 9, color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            {error && (
              <div style={{ background: '#2a1010', border: '1px solid #3d1515', borderRadius: 8, padding: '0.625rem 0.875rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: ORANGE, color: '#fff', border: 'none', padding: '0.75rem', borderRadius: 9, fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
              {loading ? 'Inloggen...' : 'Inloggen'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#333', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          Heb je geen account? Neem contact op via{' '}
          <a href="mailto:info@webtijger.nl" style={{ color: ORANGE, textDecoration: 'none' }}>info@webtijger.nl</a>
        </p>
      </div>
    </div>
  )
}
