'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const ORANGE = '#f97316'
const FONT = "'Plus Jakarta Sans', sans-serif"
const statusColor = { 'signed': '#22c55e', 'pending': ORANGE, 'draft': '#9ca3af', 'cancelled': '#ef4444' }
const statusLabel = { 'signed': 'Getekend', 'pending': 'In afwachting', 'draft': 'Concept', 'cancelled': 'Geannuleerd' }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13.5, outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: FONT }

export default function AdminContracts() {
  const [contracts, setContracts] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [uploading, setUploading] = useState(false)
  const emptyForm = { client_email: '', title: '', status: 'draft', signed_date: '', pdf_url: '' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: c }, { data: cl }] = await Promise.all([
      supabase.from('contracts').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('name, email').order('name'),
    ])
    setContracts(c || [])
    setClients(cl || [])
    setLoading(false)
  }

  async function uploadPdf(file) {
    if (!file || file.type !== 'application/pdf') { alert('Alleen PDF bestanden toegestaan.'); return null }
    setUploading(true)
    const filename = `contracts/${Date.now()}_${file.name.replace(/\s/g, '_')}`
    const { error } = await supabase.storage.from('documents').upload(filename, file, { contentType: 'application/pdf', upsert: true })
    if (error) { alert('Upload mislukt: ' + error.message); setUploading(false); return null }
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filename)
    setUploading(false)
    return urlData.publicUrl
  }

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const url = await uploadPdf(file)
    if (url) setForm(f => ({ ...f, pdf_url: url }))
  }

  async function save() {
    if (editItem) await supabase.from('contracts').update(form).eq('id', editItem.id)
    else await supabase.from('contracts').insert(form)
    setShowForm(false); setEditItem(null); setForm(emptyForm); fetchAll()
  }

  async function remove(id) {
    if (!confirm('Overeenkomst verwijderen?')) return
    await supabase.from('contracts').delete().eq('id', id)
    fetchAll()
  }

  function openEdit(c) {
    setEditItem(c)
    setForm({ client_email: c.client_email, title: c.title, status: c.status, signed_date: c.signed_date || '', pdf_url: c.pdf_url || c.file_url || '' })
    setShowForm(true)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Overeenkomsten</h1>
          <p style={{ color: '#9ca3af', marginTop: '0.3rem', fontSize: '0.9rem' }}>{contracts.length} overeenkomsten in totaal</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
          style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: FONT }}>
          + Overeenkomst
        </button>
      </div>

      {loading ? <p style={{ color: '#9ca3af' }}>Laden...</p> : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#faf9f7' }}>
                {['Klant', 'Titel', 'Status', 'Getekend op', 'PDF', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13.5, fontWeight: 500 }}>{c.client_email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13.5, fontWeight: 600 }}>{c.title}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: (statusColor[c.status] || '#9ca3af') + '18', color: statusColor[c.status] || '#9ca3af', padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                      {statusLabel[c.status] || c.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{c.signed_date ? new Date(c.signed_date).toLocaleDateString('nl-NL') : '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {(c.pdf_url || c.file_url)
                      ? <a href={c.pdf_url || c.file_url} target="_blank" rel="noreferrer" style={{ color: ORANGE, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>📄 Bekijken</a>
                      : <span style={{ color: '#d1d5db', fontSize: 12 }}>Geen PDF</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(c)} style={{ fontSize: 12, padding: '5px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 7, cursor: 'pointer', fontFamily: FONT, fontWeight: 600 }}>Bewerken</button>
                      <button onClick={() => remove(c.id)} style={{ fontSize: 12, padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 7, cursor: 'pointer', fontFamily: FONT, fontWeight: 600 }}>Verwijder</button>
                    </div>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>Geen overeenkomsten gevonden</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '1.75rem', width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{editItem ? 'Bewerken' : 'Nieuwe overeenkomst'}</span>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>

            {[['Klant', 'client_email', 'select'], ['Titel', 'title', 'text'], ['Status', 'status', 'status-select'], ['Getekend op', 'signed_date', 'date']].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</label>
                {type === 'select' ? (
                  <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle}>
                    <option value="">Selecteer klant</option>
                    {clients.map(c => <option key={c.email} value={c.email}>{c.name}</option>)}
                  </select>
                ) : type === 'status-select' ? (
                  <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle}>
                    <option value="draft">Concept</option><option value="pending">In afwachting</option><option value="signed">Getekend</option><option value="cancelled">Geannuleerd</option>
                  </select>
                ) : (
                  <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                )}
              </div>
            ))}

            {/* PDF Upload */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>PDF overeenkomst</label>
              <div style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: '1rem', textAlign: 'center', background: '#faf9f7' }}>
                {form.pdf_url ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <a href={form.pdf_url} target="_blank" rel="noreferrer" style={{ color: ORANGE, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>📄 PDF gekoppeld — bekijken</a>
                    <button onClick={() => setForm(f => ({ ...f, pdf_url: '' }))} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18 }}>×</button>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: '0.5rem' }}>{uploading ? 'Uploaden...' : 'Sleep een PDF hier of klik om te selecteren'}</p>
                    <input type="file" accept=".pdf" onChange={handleFileChange} disabled={uploading} style={{ display: 'block', margin: '0 auto', fontSize: 12, cursor: 'pointer' }} />
                  </>
                )}
              </div>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>De klant kan deze PDF downloaden via het portaal.</p>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '9px 16px', background: '#fff', color: '#111', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13, cursor: 'pointer', fontFamily: FONT, fontWeight: 600 }}>Annuleren</button>
              <button onClick={save} disabled={uploading} style={{ padding: '9px 16px', background: '#0f0f0f', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, opacity: uploading ? 0.6 : 1 }}>
                {uploading ? 'Uploaden...' : editItem ? 'Opslaan' : 'Aanmaken'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
