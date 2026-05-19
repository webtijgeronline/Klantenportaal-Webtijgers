'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'

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
    <div style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Mascotte + logo */}
        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
          <Image src="/mascotte.png" alt="Webtijger mascotte" width={140} height={140} style={{ objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(249,115,22,0.2))' }} />
        </div>
        <Image src="/logo-transparent.png" alt="Webtijger" width={160} height={52} style={{ objectFit: 'contain', marginBottom: '0.25rem' }} />
        <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '2rem' }}>Klantportaal</p>

        {/* Card */}
        <div style={{ width: '100%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>Welkom terug</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Log in op je persoonlijke portaal</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem', letterSpacing: '0.01em' }}>E-mailadres</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jouw@email.nl" required
                style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#faf9f7', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#111' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>Wachtwoord</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: '100%', padding: '0.7rem 0.9rem', background: '#faf9f7', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#111' }} />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '0.6rem 0.875rem', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: ORANGE, color: '#fff', border: 'none', padding: '0.8rem', borderRadius: 10, fontSize: '0.95rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
              {loading ? 'Inloggen...' : 'Inloggen →'}
            </button>
          </form>
        </div>

        <p style={{ color: '#b0b0b0', fontSize: '0.8rem', marginTop: '1.25rem', textAlign: 'center' }}>
          Geen account?{' '}
          <a href="mailto:info@webtijger.nl" style={{ color: ORANGE, textDecoration: 'none', fontWeight: 700 }}>Mail ons</a>
        </p>
      </div>
    </div>
  )
}
