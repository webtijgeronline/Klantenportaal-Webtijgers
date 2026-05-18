'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const T = { ink: '#0a0a0a', muted: '#9ca3af', subtle: '#6b7280', border: '#e5e7eb', borderLight: '#f3f4f6', surface: '#fff', bg: '#f9fafb', blue: '#2563eb', green: '#16a34a', red: '#dc2626', amber: '#d97706', font: "'DM Sans', sans-serif" }
const fStyle = { width: '100%', padding: '8px 11px', border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 13, color: T.ink, outline: 'none', background: T.surface, boxSizing: 'border-box', fontFamily: T.font }
const TICKET_SM = { open: { label: 'Open', color: T.red, bg: '#fef2f2', border: '#fecaca' }, in_progress: { label: 'In behandeling', color: T.amber, bg: '#fffbeb', border: '#fde68a' }, resolved: { label: 'Opgelost', color: T.green, bg: '#f0fdf4', border: '#bbf7d0' }, closed: { label: 'Gesloten', color: T.subtle, bg: T.bg, border: T.border } }

export default function PortalSupport() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' })
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('wt_user')
    if (!stored) return
    const u = JSON.parse(stored)
    setEmail(u.email); setName(u.name)
    supabase.from('support_tickets').select('*').eq('client_email', u.email).order('created_at', { ascending: false }).then(({ data }) => {
      setTickets(data || []); setLoading(false)
    })
  }, [])

  const submit = async () => {
    if (!form.subject || !form.message) return
    setSaving(true)
    const { data } = await supabase.from('support_tickets').insert({ ...form, client_email: email, client_name: name, status: 'open' }).select().single()
    if (data) setTickets(p => [data, ...p])
    setForm({ subject: '', message: '', priority: 'medium' }); setOpen(false); setSaving(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: T.ink, letterSpacing: '-0.4px' }}>Support</h2>
        <button onClick={() => setOpen(true)} style={{ padding: '8px 15px', background: T.ink, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: T.font }}>Nieuw ticket</button>
      </div>

      {loading ? <div style={{ color: T.muted, fontSize: 13 }}>Laden...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tickets.map(t => {
            const s = TICKET_SM[t.status] || TICKET_SM.open
            return (
              <div key={t.id} style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: t.admin_reply ? 12 : 0 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 3 }}>{t.subject}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>{new Date(t.created_at).toLocaleDateString('nl-NL')}</div>
                    <div style={{ fontSize: 13, color: T.subtle }}>{t.message}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 500, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 99, padding: '3px 9px', whiteSpace: 'nowrap', flexShrink: 0, height: 'fit-content' }}>{s.label}</span>
                </div>
                {t.admin_reply && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.borderLight}`, paddingLeft: 12, borderLeft: `2px solid ${T.blue}` }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: T.blue, marginBottom: 4 }}>Reactie van Webtijger</div>
                    <div style={{ fontSize: 13, color: T.subtle }}>{t.admin_reply}</div>
                  </div>
                )}
              </div>
            )
          })}
          {tickets.length === 0 && <div style={{ padding: '36px 0', textAlign: 'center', fontSize: 13, color: T.muted }}>Je hebt nog geen tickets ingediend.</div>}
        </div>
      )}

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setOpen(false)}>
          <div style={{ background: T.surface, borderRadius: 16, padding: '26px 26px 22px', width: '100%', maxWidth: 480, border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>Nieuw support ticket</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 20, fontFamily: T.font }}>×</button>
            </div>
            <div style={{ marginBottom: 13 }}><label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: T.subtle, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Onderwerp</label><input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} style={fStyle} onFocus={e => e.target.style.borderColor = T.blue} onBlur={e => e.target.style.borderColor = T.border} /></div>
            <div style={{ marginBottom: 13 }}><label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: T.subtle, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Beschrijving</label><textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={4} style={{ ...fStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={e => e.target.style.borderColor = T.blue} onBlur={e => e.target.style.borderColor = T.border} /></div>
            <div style={{ marginBottom: 13 }}><label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: T.subtle, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Prioriteit</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} style={{ ...fStyle, cursor: 'pointer' }}><option value="low">Laag</option><option value="medium">Normaal</option><option value="high">Urgent</option></select></div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
              <button onClick={() => setOpen(false)} style={{ padding: '8px 15px', background: T.surface, color: T.ink, border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>Annuleren</button>
              <button onClick={submit} disabled={saving || !form.subject || !form.message} style={{ padding: '8px 15px', background: T.ink, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1, fontFamily: T.font }}>{saving ? 'Versturen...' : 'Versturen'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
