'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const ORANGE = '#f97316'

const SECTIONS = [
  { key: 'logo_branding', label: 'Logo & Branding', desc: 'Logobestanden, huisstijl, kleurenpalet' },
  { key: 'fotos', label: "Foto's", desc: 'Professionele foto\'s van jou, je team of product' },
  { key: 'website_teksten', label: 'Website teksten', desc: 'Alle teksten: wie zijn wij, diensten, contact' },
  { key: 'bedrijfsinformatie', label: 'Bedrijfsinformatie', desc: 'KVK, adres, telefoonnummer, openingstijden' },
  { key: 'inspiratie', label: 'Inspiratie & Voorbeelden', desc: 'Websites die je mooi vindt, stijlreferenties' },
  { key: 'documenten', label: 'Documenten', desc: 'Brochures, prijslijsten, certificaten' },
  { key: 'website_bestanden', label: 'Website bestanden', desc: 'Bestaande bestanden van je oude website' },
]

export default function PortalAanleveren() {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    const email = sessionStorage.getItem('clientEmail')
    if (email) fetchRecord(email)
    else setLoading(false)
  }, [])

  async function fetchRecord(email) {
    const { data } = await supabase.from('aanleveren').select('*').eq('client_email', email).single()
    setRecord(data || null)
    setLoading(false)
  }

  async function toggle(key) {
    if (!record) return
    setSaving(key)
    const newVal = !record[key]
    await supabase.from('aanleveren').update({ [key]: newVal }).eq('id', record.id)
    setRecord(r => ({ ...r, [key]: newVal }))
    setSaving(null)
  }

  const done = record ? SECTIONS.filter(s => record[s.key]).length : 0
  const pct = Math.round((done / SECTIONS.length) * 100)

  return (
    <div style={{ padding: '2rem', maxWidth: 700 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>Aanleveren</h1>
      <p style={{ color: '#6b7280', marginTop: '0.3rem', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
        Lever hier alle benodigde bestanden en informatie aan voor jouw website.
      </p>

      {loading ? <p style={{ color: '#6b7280' }}>Laden...</p> : !record ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          Geen aanleveren-record gevonden. Neem contact op via <a href="mailto:info@webtijger.nl" style={{ color: ORANGE }}>info@webtijger.nl</a>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Voortgang aanleveren</span>
              <span style={{ fontWeight: 700, color: pct === 100 ? '#22c55e' : ORANGE, fontSize: '1rem' }}>{done}/{SECTIONS.length} compleet</span>
            </div>
            <div style={{ background: '#f3f4f6', borderRadius: 999, height: 8 }}>
              <div style={{ background: pct === 100 ? '#22c55e' : ORANGE, height: '100%', borderRadius: 999, width: pct + '%', transition: 'width 0.4s' }} />
            </div>
          </div>

          {/* Drive link */}
          {record.drive_folder && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111' }}>Google Drive map</p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>Upload hier je bestanden</p>
              </div>
              <a href={record.drive_folder} target="_blank" rel="noreferrer"
                style={{ background: ORANGE, color: '#fff', padding: '0.5rem 1rem', borderRadius: 9, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                Drive openen
              </a>
            </div>
          )}

          {/* Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {SECTIONS.map(s => {
              const checked = !!record[s.key]
              return (
                <div key={s.key}
                  onClick={() => toggle(s.key)}
                  style={{
                    background: '#fff', border: `1px solid ${checked ? '#bbf7d0' : '#e5e7eb'}`,
                    borderRadius: 12, padding: '1rem 1.25rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    cursor: 'pointer', transition: 'all 0.15s',
                    opacity: saving === s.key ? 0.6 : 1,
                  }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: checked ? '#22c55e' : '#f3f4f6',
                    border: `2px solid ${checked ? '#22c55e' : '#d1d5db'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s'
                  }}>
                    {checked && <span style={{ color: '#fff', fontSize: 13, lineHeight: 1 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: checked ? '#6b7280' : '#111', textDecoration: checked ? 'line-through' : 'none' }}>{s.label}</p>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 1 }}>{s.desc}</p>
                  </div>
                  {checked && <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, flexShrink: 0 }}>Aangeleverd</span>}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
