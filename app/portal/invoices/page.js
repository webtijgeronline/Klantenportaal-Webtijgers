'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const ORANGE = '#f97316'
const statusColor = { 'paid': '#22c55e', 'unpaid': ORANGE, 'overdue': '#ef4444', 'draft': '#9ca3af' }
const statusLabel = { 'paid': 'Betaald', 'unpaid': 'Onbetaald', 'overdue': 'Verlopen', 'draft': 'Concept' }

export default function PortalInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email = sessionStorage.getItem('clientEmail')
    if (email) fetchInvoices(email)
    else setLoading(false)
  }, [])

  async function fetchInvoices(email) {
    const { data } = await supabase.from('invoices').select('*').eq('client_email', email).order('created_at', { ascending: false })
    setInvoices(data || [])
    setLoading(false)
  }

  const openstaand = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0)

  return (
    <div style={{ padding: '2rem', maxWidth: 760 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Facturen</h1>
      <p style={{ color: '#9ca3af', marginTop: '0.3rem', fontSize: '0.95rem', marginBottom: '1.75rem' }}>Bekijk en download jouw facturen.</p>

      {openstaand > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Openstaand bedrag</p>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: 2 }}>Neem contact op via info@webtijger.nl voor betaalinformatie</p>
          </div>
          <p style={{ fontWeight: 800, fontSize: '1.25rem', color: ORANGE }}>€{openstaand.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
        </div>
      )}

      {loading ? <p style={{ color: '#9ca3af' }}>Laden...</p> : invoices.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧾</p>
          <p style={{ fontWeight: 600 }}>Geen facturen gevonden</p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>Je facturen verschijnen hier zodra ze beschikbaar zijn.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#faf9f7' }}>
                {['Nummer', 'Omschrijving', 'Bedrag', 'Vervaldatum', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={inv.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700 }}>{inv.invoice_number || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{inv.description || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13.5, fontWeight: 800 }}>€{parseFloat(inv.amount || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('nl-NL') : '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: (statusColor[inv.status] || '#9ca3af') + '18', color: statusColor[inv.status] || '#9ca3af', padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                      {statusLabel[inv.status] || inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {inv.pdf_url ? (
                      <a href={inv.pdf_url} target="_blank" rel="noreferrer"
                        style={{ background: '#0f0f0f', color: '#fff', padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                        ↓ Download
                      </a>
                    ) : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
