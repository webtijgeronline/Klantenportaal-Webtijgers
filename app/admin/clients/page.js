'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const T = { ink: '#0a0a0a', muted: '#9ca3af', subtle: '#6b7280', border: '#e5e7eb', borderLight: '#f3f4f6', surface: '#fff', bg: '#f9fafb', blue: '#2563eb', red: '#dc2626', font: "'DM Sans', sans-serif" }
const fStyle = { width: '100%', padding: '8px 11px', border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 13, color: T.ink, outline: 'none', background: T.surface, boxSizing: 'border-box', fontFamily: T.font }

function Field({ label, children }) {
  return <div style={{ marginBottom: 13 }}><label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: T.subtle, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</label>{children}</div>
}

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [showPw, setShowPw] = useState({})
  const [form, setForm] = useState({ name: '', email: '', phone: '', password_plain: '' })
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

  const openAdd = () => { setForm({ name: '', email: '', phone: '', password_plain: '' }); setEditId(null); setOpen(true) }
  const openEdit = (c) => { setForm({ name: c.name, email: c.email, phone: c.phone || '', password_plain: c.password_plain }); setEditId(c.id); setOpen(true) }

  const save = async () => {
    if (!form.name || !form.email || !form.password_plain) return
    setSaving(true)
    if (editId) {
      await supabase.from('clients').update(form).eq('id', editId)
    } else {
      const { data: newClient } = await supabase.from('clients').insert({ ...form, joined: new Date().toISOString().split('T')[0] }).select().single()
      // Auto-create aanleveren record for new client
      if (newClient) {
        await supabase.from('aanleveren').insert({
          client_email: newClient.email,
          sections: [
            { id: 'logo', label: 'Logo & Branding', desc: 'Upload je logo (PNG, SVG, JPG) en eventuele huisstijlbestanden.', done: false },
            { id: 'fotos', label: "Foto's", desc: "Teamfoto's, bedrijfsfoto's, productfoto's of locatiefoto's.", done: false },
            { id: 'teksten', label: 'Website teksten', desc: 'Teksten per pagina: wie zijn jullie, diensten, over ons, contact etc.', done: false },
            { id: 'bedrijfsinfo', label: 'Bedrijfsinformatie', desc: 'KVK-nummer, adres, openingstijden, contactgegevens.', done: false },
            { id: 'inspiratie', label: 'Inspiratie & Voorbeelden', desc: 'Websites die je mooi vindt, referenties of moodboards.', done: false },
            { id: 'documenten', label: 'Documenten', desc: 'Algemene voorwaarden, privacy statement of andere documenten.', done: false },
            { id: 'overig', label: 'Website bestanden', desc: 'Bestaande website exports of andere technische bestanden.', done: false },
          ]
        })
      }
    }
    setSaving(false); setOpen(false); load()
  }

  const remove = async (id) => {
    if (!confirm('Klant verwijderen?')) return
    await supabase.from('clients').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: T.ink, letterSpacing: '-0.4px' }}>Klanten</h2>
        <button onClick={openAdd} style={{ padding: '8px 15px', background: T.ink, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: T.font }}>Klant toevoegen</button>
      </div>

      {loading ? <div style={{ color: T.muted, fontSize: 13 }}>Laden...</div> : (
        <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                {['Naam', 'E-mailadres', 'Telefoon', 'Wachtwoord', 'Klant sinds', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: T.ink }}>{c.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: T.subtle }}>{c.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: T.subtle }}>{c.phone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: T.ink, background: T.bg, padding: '3px 8px', borderRadius: 6, border: `1px solid ${T.borderLight}` }}>
                        {showPw[c.id] ? c.password_plain : '••••••••'}
                      </span>
                      <button onClick={() => setShowPw(s => ({ ...s, [c.id]: !s[c.id] }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: T.muted, fontFamily: T.font }}>
                        {showPw[c.id] ? 'Verberg' : 'Toon'}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: T.muted }}>{c.joined ? new Date(c.joined).toLocaleDateString('nl-NL') : '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(c)} style={{ fontSize: 12, padding: '5px 11px', background: T.surface, color: T.ink, border: `1px solid ${T.border}`, borderRadius: 6, cursor: 'pointer', fontFamily: T.font }}>Bewerken</button>
                      <button onClick={() => remove(c.id)} style={{ fontSize: 12, padding: '5px 11px', background: '#fef2f2', color: T.red, border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontFamily: T.font }}>Verwijderen</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setOpen(false)}>
          <div style={{ background: T.surface, borderRadius: 16, padding: '26px 26px 22px', width: '100%', maxWidth: 480, border: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>{editId ? 'Klant bewerken' : 'Nieuwe klant'}</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 20, fontFamily: T.font }}>×</button>
            </div>
            <Field label="Naam"><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={fStyle} placeholder="Studio Bloem" onFocus={e => e.target.style.borderColor = T.blue} onBlur={e => e.target.style.borderColor = T.border} /></Field>
            <Field label="E-mailadres"><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={fStyle} placeholder="info@studio.nl" onFocus={e => e.target.style.borderColor = T.blue} onBlur={e => e.target.style.borderColor = T.border} /></Field>
            <Field label="Telefoonnummer"><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={fStyle} placeholder="06-12345678" onFocus={e => e.target.style.borderColor = T.blue} onBlur={e => e.target.style.borderColor = T.border} /></Field>
            <Field label="Wachtwoord portaal">
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={form.password_plain} onChange={e => setForm({...form, password_plain: e.target.value})} style={{ ...fStyle, fontFamily: 'monospace' }} placeholder="Kies een wachtwoord" onFocus={e => e.target.style.borderColor = T.blue} onBlur={e => e.target.style.borderColor = T.border} />
                <button onClick={genPassword} style={{ padding: '8px 12px', background: T.surface, color: T.ink, border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 12, cursor: 'pointer', fontFamily: T.font, flexShrink: 0 }}>Genereer</button>
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>Deel dit wachtwoord met de klant. Ze loggen in met hun e-mailadres.</div>
            </Field>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
              <button onClick={() => setOpen(false)} style={{ padding: '8px 15px', background: T.surface, color: T.ink, border: `1px solid ${T.border}`, borderRadius: 7, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>Annuleren</button>
              <button onClick={save} disabled={saving || !form.name || !form.email || !form.password_plain} style={{ padding: '8px 15px', background: T.ink, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1, fontFamily: T.font }}>{saving ? 'Opslaan...' : editId ? 'Opslaan' : 'Klant aanmaken'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
