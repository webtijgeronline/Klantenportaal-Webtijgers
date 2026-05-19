'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const ORANGE = '#f97316'
const statusColor = { 'open': '#ef4444', 'in_progress': ORANGE, 'resolved': '#22c55e', 'closed': '#9ca3af' }
const statusLabel = { 'open': 'Open', 'in_progress': 'In behandeling', 'resolved': 'Opgelost', 'closed': 'Gesloten' }
const priorityLabel = { 'low': 'Laag', 'medium': 'Normaal', 'high': 'Hoog', 'urgent': 'Urgent' }

export default function PortalSupport() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' })
  const [sending, setSending] = useState(false)
  const [clientEmail, setClientEmail] = useState('')

  useEffect(() => {
    const email = sessionStorage.getItem('clientEmail')
    if (email) { setClientEmail(email); fetchTickets(email) }
    else setLoading(false)
  }, [])

  async function fetchTickets(email) {
    const { data } = await supabase.from('support_tickets').select('*').eq('client_email', email).order('created_at', { ascending: false })
    setTickets(data || [])
    setLoading(false)
  }

  async function submit() {
    if (!form.subject.trim() || !form.message.trim()) return
    setSending(true)
    await supabase.from('support_tickets').insert({ ...form, client_email: clientEmail, status: 'open' })
    setForm({ subject: '', message: '', priority: 'medium' })
    setShowForm(false)
    fetchTickets(clientEmail)
    setSending(false)
  }

  const inputStyle = { width: '100%', padding: '0.65rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }

  return (
    <div style={{ padding: '2rem', maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>Support</h1>
          <p style={{ color: '#6b7280', marginTop: '0.3rem', fontSize: '0.95rem' }}>Krijg hulp bij jouw website of diensten.</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ background: ORANGE, color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: 9, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', flexShrink: 0 }}>
          + Nieuw verzoek
        </button>
      </div>

      {/* New ticket modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Nieuw supportverzoek</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Onderwerp</label>
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Beschrijf je vraag kort" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Omschrijving</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Beschrijf jouw vraag of probleem..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Prioriteit</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
                  <option value="low">Lage prioriteit</option>
                  <option value="medium">Normale prioriteit</option>
                  <option value="high">Hoge prioriteit</option>
                </select>
              </div>
              <button onClick={submit} disabled={sending || !form.subject.trim()} style={{ background: ORANGE, color: '#fff', border: 'none', padding: '0.75rem', borderRadius: 9, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: sending ? 0.7 : 1 }}>
                {sending ? 'Versturen...' : 'Verzoek versturen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: '#6b7280' }}>Laden...</p> : tickets.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</p>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Geen openstaande tickets</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Heb je een vraag? Maak een nieuw verzoek aan.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tickets.map(t => (
            <div key={t.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.subject}</p>
                <span style={{ background: (statusColor[t.status] || '#9ca3af') + '18', color: statusColor[t.status] || '#9ca3af', padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, flexShrink: 0, marginLeft: '1rem' }}>
                  {statusLabel[t.status] || t.status}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '0.75rem' }}>{t.message}</p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#9ca3af' }}>
                <span>{new Date(t.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>·</span>
                <span>{priorityLabel[t.priority] || t.priority} prioriteit</span>
              </div>
              {t.admin_note && (
                <div style={{ marginTop: '0.875rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 9, padding: '0.75rem 1rem' }}>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: ORANGE, marginBottom: '0.25rem' }}>Reactie van Webtijger</p>
                  <p style={{ fontSize: '0.875rem', color: '#374151' }}>{t.admin_note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
