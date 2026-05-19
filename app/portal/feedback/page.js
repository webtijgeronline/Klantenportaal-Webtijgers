'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const ORANGE = '#f97316'

export default function PortalFeedback() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [existing, setExisting] = useState([])
  const [clientEmail, setClientEmail] = useState('')
  const [form, setForm] = useState({ rating: 5, message: '' })
  const [hovered, setHovered] = useState(0)

  useEffect(() => {
    const email = sessionStorage.getItem('clientEmail')
    if (email) { setClientEmail(email); fetchExisting(email) }
  }, [])

  async function fetchExisting(email) {
    const { data } = await supabase.from('feedback').select('*').eq('client_email', email).order('created_at', { ascending: false })
    setExisting(data || [])
  }

  async function submit() {
    if (!form.message.trim()) return
    setLoading(true)
    await supabase.from('feedback').insert({ client_email: clientEmail, rating: form.rating, message: form.message })
    setSubmitted(true)
    setLoading(false)
    fetchExisting(clientEmail)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>Feedback</h1>
      <p style={{ color: '#6b7280', marginTop: '0.3rem', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
        Deel je ervaring met Webtijger. Jouw feedback helpt ons verbeteren.
      </p>

      {submitted ? (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</p>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.3rem' }}>Bedankt voor je feedback!</p>
          <p style={{ color: '#16a34a', fontSize: '0.875rem' }}>We waarderen het enorm dat je de tijd hebt genomen.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '1rem' }}>Hoe beoordeel je jouw ervaring?</p>

          {/* Star rating */}
          <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.5rem' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n}
                onClick={() => setForm({ ...form, rating: n })}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '2rem', padding: '0 2px', lineHeight: 1, color: n <= (hovered || form.rating) ? ORANGE : '#e5e7eb', transition: 'color 0.1s' }}>
                ★
              </button>
            ))}
          </div>

          <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Jouw bericht</p>
          <textarea
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            placeholder="Schrijf hier je feedback..."
            rows={4}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', background: '#faf9f7' }}
          />
          <button onClick={submit} disabled={loading || !form.message.trim()}
            style={{ marginTop: '1rem', background: ORANGE, color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: loading || !form.message.trim() ? 0.6 : 1 }}>
            {loading ? 'Versturen...' : 'Feedback versturen'}
          </button>
        </div>
      )}

      {existing.length > 0 && (
        <div>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Eerdere feedback</p>
          {existing.map(f => (
            <div key={f.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= f.rating ? ORANGE : '#e5e7eb', fontSize: '1rem' }}>★</span>)}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{new Date(f.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>{f.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
