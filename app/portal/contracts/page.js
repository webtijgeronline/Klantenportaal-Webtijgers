'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const ORANGE = '#f97316'
const statusColor = { 'signed': '#22c55e', 'pending': ORANGE, 'draft': '#9ca3af', 'cancelled': '#ef4444' }
const statusLabel = { 'signed': 'Getekend', 'pending': 'In afwachting', 'draft': 'Concept', 'cancelled': 'Geannuleerd' }

export default function PortalContracts() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email = sessionStorage.getItem('clientEmail')
    if (email) fetchContracts(email)
    else setLoading(false)
  }, [])

  async function fetchContracts(email) {
    const { data } = await supabase.from('contracts').select('*').eq('client_email', email).order('created_at', { ascending: false })
    setContracts(data || [])
    setLoading(false)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 700 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>Overeenkomst</h1>
      <p style={{ color: '#6b7280', marginTop: '0.3rem', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
        Bekijk en download jouw overeenkomst met Webtijger.
      </p>

      {loading ? <p style={{ color: '#6b7280' }}>Laden...</p> : contracts.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</p>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#111' }}>Geen overeenkomsten gevonden</p>
          <p style={{ fontSize: '0.875rem' }}>Je overeenkomst wordt hier getoond zodra deze beschikbaar is.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {contracts.map(c => (
            <div key={c.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ height: 3, background: statusColor[c.status] || '#9ca3af' }} />
              <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{c.title}</p>
                  {c.signed_date && (
                    <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                      Getekend op {new Date(c.signed_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, marginLeft: '1rem' }}>
                  <span style={{ background: (statusColor[c.status] || '#9ca3af') + '18', color: statusColor[c.status] || '#9ca3af', padding: '4px 12px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600 }}>
                    {statusLabel[c.status] || c.status}
                  </span>
                  {c.file_url && (
                    <a href={c.file_url} target="_blank" rel="noreferrer"
                      style={{ background: '#0f0f0f', color: '#fff', padding: '0.45rem 1rem', borderRadius: 9, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                      Bekijken
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
