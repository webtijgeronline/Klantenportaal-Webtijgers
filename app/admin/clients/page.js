'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const ORANGE = '#f97316'
const FONT = "'Plus Jakarta Sans', sans-serif"
const T = { border: '#e5e7eb', bg: '#faf9f7', muted: '#9ca3af', subtle: '#6b7280', red: '#dc2626' }

const AVATARS = [
  { id: 'tiger', emoji: '🐯' },
  { id: 'rocket', emoji: '🚀' },
  { id: 'star', emoji: '⭐' },
  { id: 'diamond', emoji: '💎' },
  { id: 'fire', emoji: '🔥' },
  { id: 'crown', emoji: '👑' },
  { id: 'heart', emoji: '💙' },
  { id: 'globe', emoji: '🌍' },
  { id: 'bolt', emoji: '⚡' },
  { id: 'plant', emoji: '🌿' },
  { id: 'shop', emoji: '🏪' },
  { id: 'palette', emoji: '🎨' },
]

const fStyle = { width: '100%', padding: '9px 12px', border: `1.5px solid #e5e7eb`, borderRadius: 9, fontSize: 13.5, color: '#111', outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: FONT }

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</label>
      {children}
    </div>
  )
}

function ClientAvatar({ client, size = 36 }) {
  const avatar = AVATARS.find(a => a.id === client.avatar)
  if (avatar) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: '#fff7ed', border: '1.5px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.45, flexShrink: 0 }}>
        {avatar.emoji}
      </div>
    )
  }
  const initials = client.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  const colors = ['#f97316', '#3b82f6', '#8b5cf6', '#22c55e', '#ec4899', '#14b8a6']
  const color = colors[(client.name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color + '18', border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 800, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [showPw, setShowPw] = useState({})
  const [form, setForm] = useState({ name: '', email: '', phone: '', password_plain: '', avatar: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('clients').select('*').order('joined', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const genPassword = () => {
    const w = ['tijger', 'web', 'site', 'design', 'bloem', 'project']
    const n = Math.floor(Math.random() * 900) + 100
    setForm(f => ({ ...f, password_plain: w[Math.floor(Math.random() * w.length)] + n }))
  }

  const openAdd = () => { setForm({ name: '', email: '', phone: '', password_plain: '', avatar: '' }); setEditId(null); setOpen(true) }
  const openEdit = (c) => { setForm({ name: c.name, email: c.email, phone: c.phone || '', password_plain: c.password_plain || '', avatar: c.avatar || '' }); setEditId(c.id); setOpen(true) }

  const save = async () => {
    if (!form.name || !form.email || !form.password_plain) return
    setSaving(true)
    if (editId) {
      await supabase.from('clients').update(form).eq('id', editId)
    } else {
      const { data: newClient } = await supabase.from('clients').insert({ ...form, joined: new Date().toISOString().split('T')[0] }).select().single()
      if (newClient) await supabase.from('aanleveren').insert({ client_email: newClient.email })
    }
    setSaving(false); setOpen(false); load()
  }

  const remove = async (id) => {
    if (!confirm('Klant verwijderen?')) return
    await supabase.from('clients').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Klanten</h1>
          <p style={{ color: '#9ca3af', marginTop: '0.3rem', fontSize: '0.9rem' }}>{clients.length} klant{clients.length !== 1 ? 'en' : ''} in totaal</p>
        </div>
        <button onClick={openAdd} style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: FONT }}>
          + Klant toevoegen
        </button>
      </div>

      {loading ? <p style={{ color: '#9ca3af' }}>Laden...</p> : (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#faf9f7' }}>
                {['Klant', 'E-mailadres', 'Telefoon', 'Wachtwoord', 'Klant sinds', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <ClientAvatar client={c} size={34} />
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{c.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{c.phone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', background: '#f3f4f6', padding: '3px 8px', borderRadius: 6 }}>
                        {showPw[c.id] ? c.password_plain : '••••••••'}
                      </span>
                      <button onClick={() => setShowPw(s => ({ ...s, [c.id]: !s[c.id] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#9ca3af', fontFamily: FONT }}>
                        {showPw[c.id] ? 'Verberg' : 'Toon'}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#9ca3af' }}>{c.joined ? new Date(c.joined).toLocaleDateString('nl-NL') : '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(c)} style={{ fontSize: 12, padding: '5px 12px', background: '#fff', color: '#111', border: '1px solid #e5e7eb', borderRadius: 7, cursor: 'pointer', fontFamily: FONT, fontWeight: 600 }}>Bewerken</button>
                      <button onClick={() => remove(c.id)} style={{ fontSize: 12, padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 7, cursor: 'pointer', fontFamily: FONT, fontWeight: 600 }}>Verwijder</button>
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Nog geen klanten aangemaakt</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '1.75rem', width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{editId ? 'Klant bewerken' : 'Nieuwe klant'}</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>

            <Field label="Avatar kiezen">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {AVATARS.map(a => (
                  <button key={a.id} onClick={() => setForm(f => ({ ...f, avatar: f.avatar === a.id ? '' : a.id }))}
                    style={{ background: form.avatar === a.id ? '#fff7ed' : '#faf9f7', border: `2px solid ${form.avatar === a.id ? ORANGE : '#e5e7eb'}`, borderRadius: 10, padding: '8px 0', fontSize: '1.4rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {a.emoji}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Optioneel — laat leeg voor initialen</p>
            </Field>

            <Field label="Naam"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={fStyle} placeholder="Studio Bloem" /></Field>
            <Field label="E-mailadres"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={fStyle} placeholder="info@studio.nl" /></Field>
            <Field label="Telefoonnummer"><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={fStyle} placeholder="06-12345678" /></Field>
            <Field label="Wachtwoord portaal">
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={form.password_plain} onChange={e => setForm({ ...form, password_plain: e.target.value })} style={{ ...fStyle, fontFamily: 'monospace' }} placeholder="Kies een wachtwoord" />
                <button onClick={genPassword} style={{ padding: '9px 14px', background: '#faf9f7', color: '#111', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 12, cursor: 'pointer', fontFamily: FONT, flexShrink: 0, fontWeight: 600 }}>Genereer</button>
              </div>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>Deel dit met de klant. Ze loggen in met hun e-mailadres.</p>
            </Field>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
              <button onClick={() => setOpen(false)} style={{ padding: '9px 16px', background: '#fff', color: '#111', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13, cursor: 'pointer', fontFamily: FONT, fontWeight: 600 }}>Annuleren</button>
              <button onClick={save} disabled={saving || !form.name || !form.email || !form.password_plain}
                style={{ padding: '9px 16px', background: '#0f0f0f', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1, fontFamily: FONT }}>
                {saving ? 'Opslaan...' : editId ? 'Opslaan' : 'Klant aanmaken'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
