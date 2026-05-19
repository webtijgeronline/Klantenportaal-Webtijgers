'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const ORANGE = '#f97316'
const FONT = "'Plus Jakarta Sans', sans-serif"
const statusColor = { 'paid': '#22c55e', 'unpaid': ORANGE, 'overdue': '#ef4444', 'draft': '#9ca3af' }
const statusLabel = { 'paid': 'Betaald', 'unpaid': 'Onbetaald', 'overdue': 'Verlopen', 'draft': 'Concept' }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13.5, outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: FONT }

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [uploading, setUploading] = useState(false)
  const emptyForm = { client_email: '', invoice_number: '', amount: '', status: 'unpaid', due_date: '', description: '', pdf_url: '' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: inv }, { data: c }] = await Promise.all([
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('name, email').order('name'),
    ])
    setInvoices(inv || [])
    setClients(c || [])
    setLoading(false)
  }

  async function uploadPdf(file) {
    if (!file || file.type !== 'application/pdf') { alert('Alleen PDF bestanden toegestaan.'); return null }
    setUploading(true)
    const filename = `invoices/${Date.now()}_${file.name.replace(/\s/g, '_')}`
    const { data, error } = await supabase.storage.from('documents').upload(filename, file, { contentType: 'application/pdf', upsert: true })
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
    const data = { ...form, amount: parseFloat(form.amount) || 0 }
    if (editItem) await supabase.from('invoices').update(data).eq('id', editItem.id)
    else await supabase.from('invoices').insert(data)
    setShowForm(false); setEditItem(null); setForm(emptyForm); fetchAll()
  }

  async function remove(id) {
    if (!confirm('Factuur verwijderen?')) return
    await supabase.from('invoices').delete().eq('id', id)
    fetchAll()
  }

  function openEdit(inv) {
    setEditItem(inv)
    setForm({ client_email: inv.client_email, invoice_number: inv.invoice_number || '', amount: inv.amount || '', status: inv.status, due_date: inv.due_date || '', description: inv.description || '', pdf_url: inv.pdf_url || '' })
    setShowForm(true)
  }

  const total = invoices.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)
  const unpaid = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Facturen</h1>
          <p style={{ color: '#9ca3af', marginTop: '0.3rem', fontSize: '0.9rem' }}>{invoices.length} facturen in totaal</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm) }}
          style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: 10, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: FONT }}>
          + Factuur
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {[{ label: 'Totaal gefactureerd', value: `€${total.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, color: '#111' },
          { label: 'Openstaand', value: `€${unpaid.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, color: ORANGE }].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.1rem 1.25rem' }}>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>{s.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? <p style={{ color: '#9ca3af' }}>Laden...</p> : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#faf9f7' }}>
                {['Klant', 'Nummer', 'Bedrag', 'Status', 'Vervaldatum', 'PDF', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={inv.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13.5, fontWeight: 500 }}>{inv.client_email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{inv.invoice_number || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13.5, fontWeight: 700 }}>€{parseFloat(inv.amount || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: (statusColor[inv.status] || '#9ca3af') + '18', color: statusColor[inv.status] || '#9ca3af', padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                      {statusLabel[inv.status] || inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('nl-NL') : '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {inv.pdf_url
                      ? <a href={inv.pdf_url} target="_blank" rel="noreferrer" style={{ color: ORANGE, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>📄 Bekijken</a>
                      : <span style={{ color: '#d1d5db', fontSize: 12 }}>Geen PDF</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(inv)} style={{ fontSize: 12, padding: '5px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 7, cursor: 'pointer', fontFamily: FONT, fontWeight: 600 }}>Bewerken</button>
                      <button onClick={() => remove(inv.id)} style={{ fontSize: 12, padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 7, cursor: 'pointer', fontFamily: FONT, fontWeight: 600 }}>Verwijder</button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>Geen facturen gevonden</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '1.75rem', width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{editItem ? 'Factuur bewerken' : 'Nieuwe factuur'}</span>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 22, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Klant</label>
                <select value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} style={inputStyle}>
                  <option value="">Selecteer klant</option>
                  {clients.map(c => <option key={c.email} value={c.email}>{c.name}</option>)}
                </select>
              </div>
              {[['Factuurnummer', 'invoice_number', 'WT-2026-01'], ['Bedrag', 'amount', '1500']].map(([label, key, ph]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</label>
                  <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                  <option value="draft">Concept</option><option value="unpaid">Onbetaald</option><option value="paid">Betaald</option><option value="overdue">Verlopen</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Vervaldatum</label>
                <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Omschrijving</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Website project" style={inputStyle} />
              </div>
              {/* PDF upload */}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>PDF factuur</label>
                <div style={{ border: '2px dashed #e5e7eb', borderRadius: 10, padding: '1rem', textAlign: 'center', background: '#faf9f7' }}>
                  {form.pdf_url ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <a href={form.pdf_url} target="_blank" rel="noreferrer" style={{ color: ORANGE, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>📄 PDF gekoppeld — bekijken</a>
                      <button onClick={() => setForm(f => ({ ...f, pdf_url: '' }))} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 18 }}>×</button>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: '0.5rem' }}>{uploading ? 'Uploaden...' : 'Sleep een PDF hier of klik om te selecteren'}</p>
                      <input type="file" accept=".pdf" onChange={handleFileChange} disabled={uploading}
                        style={{ display: 'block', margin: '0 auto', fontSize: 12, cursor: 'pointer' }} />
                    </>
                  )}
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>De klant kan deze PDF downloaden via het portaal.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1.25rem' }}>
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
