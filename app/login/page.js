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

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Poppins', -apple-system, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Mascotte */}
        <img
          src="/mascotte-login.png"
          alt="Webtijger"
          style={{ width: 240, height: 240, objectFit: 'contain', marginBottom: '1.25rem', filter: 'drop-shadow(0 8px 24px rgba(249,115,22,0.15))' }}
        />

        {/* Card */}
        <div style={{ width: '100%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 22, padding: '2.5rem', boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.5px', marginBottom: '0.35rem' }}>Welkom terug</h2>
          <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '2rem' }}>Log in op je persoonlijke portaal</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>E-mailadres</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jouw@email.nl" required
                style={{ width: '100%', padding: '0.85rem 1rem', background: '#faf9f7', border: '1.5px solid #e5e7eb', borderRadius: 11, fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Wachtwoord</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: '100%', padding: '0.85rem 1rem', background: '#faf9f7', border: '1.5px solid #e5e7eb', borderRadius: 11, fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: ORANGE, color: '#fff', border: 'none', padding: '0.95rem', borderRadius: 11, fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
              {loading ? 'Inloggen...' : 'Inloggen →'}
            </button>
          </form>
        </div>

        <p style={{ color: '#b0b0b0', fontSize: '0.875rem', marginTop: '1.5rem' }}>
          Geen account?{' '}
          <a href="mailto:info@webtijger.nl" style={{ color: ORANGE, textDecoration: 'none', fontWeight: 600 }}>Mail ons</a>
        </p>
      </div>
    </div>
  )
}
