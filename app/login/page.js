'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const T = {
  ink: '#0a0a0a', muted: '#9ca3af', subtle: '#6b7280',
  border: '#e5e7eb', surface: '#ffffff', bg: '#f9fafb',
  blue: '#2563eb', red: '#dc2626',
  font: "'DM Sans', -apple-system, sans-serif",
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check if admin
      if (email === 'ryan@webtijger.nl' && password === 'admin') {
        localStorage.setItem('wt_user', JSON.stringify({ role: 'admin', name: 'Ryan', email }))
        router.push('/admin')
        return
      }

      // Check client credentials against Supabase
      const { data, error: dbError } = await supabase
        .from('clients')
        .select('*')
        .eq('email', email)
        .eq('password_plain', password)
        .single()

      if (dbError || !data) {
        setError('Onbekend e-mailadres of onjuist wachtwoord.')
        setLoading(false)
        return
      }

      localStorage.setItem('wt_user', JSON.stringify({
        role: 'client',
        name: data.name,
        email: data.email,
      }))
      router.push('/portal')
    } catch (err) {
      setError('Er ging iets mis. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: T.font }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: T.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L3 7.5l9 4.5 9-4.5L12 3zM3 16.5l9 4.5 9-4.5M3 12l9 4.5 9-4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: T.ink, letterSpacing: '-0.4px' }}>Webtijger</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>Meld je aan om verder te gaan</div>
        </div>

        {/* Form */}
        <div style={{ background: T.surface, borderRadius: 14, padding: '28px 28px 24px', border: `1px solid ${T.border}` }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: T.subtle, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                E-mailadres
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="jouw@email.nl"
                style={{ width: '100%', padding: '9px 12px', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, color: T.ink, outline: 'none', background: T.surface, boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = T.blue}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: T.subtle, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Wachtwoord
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '9px 42px 9px 12px', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, color: T.ink, outline: 'none', background: T.surface, boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = T.blue}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: T.muted, fontFamily: T.font }}>
                  {showPass ? 'Verberg' : 'Toon'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 12, color: T.red, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, padding: '8px 12px', marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '10px 16px', background: T.ink, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: T.font, marginTop: 4 }}>
              {loading ? 'Bezig...' : 'Inloggen'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: T.muted, textAlign: 'center' }}>
          Geen account? Neem contact op met Webtijger.
        </div>
      </div>
    </div>
  )
}
