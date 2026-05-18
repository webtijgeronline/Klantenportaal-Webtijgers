'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const T = { ink: '#0a0a0a', muted: '#9ca3af', subtle: '#6b7280', border: '#e5e7eb', borderLight: '#f3f4f6', surface: '#fff', bg: '#f9fafb', blue: '#2563eb', green: '#16a34a' }

export default function PortalAanleveren() {
  const [aanleveren, setAanleveren] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('wt_user')
    if (!stored) return
    const { email } = JSON.parse(stored)
    supabase.from('aanleveren').select('*').eq('client_email', email).single().then(({ data }) => {
      setAanleveren(data)
      setLoading(false)
    })
  }, [])

  const toggle = async (sectionId) => {
    if (!aanleveren) return
    const updated = { ...aanleveren, sections: aanleveren.sections.map(s => s.id === sectionId ? { ...s, done: !s.done } : s) }
    setAanleveren(updated)
    await supabase.from('aanleveren').update({ sections: updated.sections }).eq('id', aanleveren.id)
  }

  if (loading) return <div style={{ color: T.muted, fontSize: 13 }}>Laden...</div>
  if (!aanleveren) return <div style={{ padding: '36px 0', textAlign: 'center', fontSize: 13, color: T.muted }}>Nog geen aanleveropdracht aangemaakt door Webtijger.</div>

  const done = aanleveren.sections.filter(s => s.done).length
  const total = aanleveren.sections.length
  const pct = Math.round((done / total) * 100)
  const allDone = done === total

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h2 style={{ margin: '0 0 3px', fontSize: 19, fontWeight: 600, color: T.ink, letterSpacing: '-0.4px' }}>Aanleveren</h2>
        <p style={{ margin: 0, fontSize: 13, color: T.muted }}>Lever de onderstaande bestanden en informatie aan voor jouw website.</p>
      </div>

      <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{allDone ? 'Alles aangeleverd!' : 'Voortgang aanleveren'}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{done} van {total} onderdelen voltooid</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: allDone ? T.green : T.ink, letterSpacing: '-1px' }}>{pct}%</div>
        </div>
        <div style={{ height: 6, background: T.borderLight, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: allDone ? T.green : T.blue, borderRadius: 99, transition: 'width 0.4s' }} />
        </div>
        {aanleveren.drive_folder && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.borderLight}` }}>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>Jouw persoonlijke bestanden map:</div>
            <a href={aanleveren.drive_folder} target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.blue, textDecoration: 'none', background: '#eff6ff', padding: '7px 14px', borderRadius: 7, border: '1px solid #bfdbfe', fontWeight: 500 }}>
              Bestanden uploaden in Google Drive
            </a>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {aanleveren.sections.map((s, i) => (
          <div key={s.id} style={{ background: s.done ? '#fafffe' : T.surface, borderRadius: 10, border: `1px solid ${s.done ? '#bbf7d0' : T.border}`, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <button onClick={() => toggle(s.id)}
                style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${s.done ? T.green : T.border}`, background: s.done ? T.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
                {s.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: s.done ? T.subtle : T.ink, textDecoration: s.done ? 'line-through' : 'none' }}>
                    {String(i + 1).padStart(2, '0')}. {s.label}
                  </div>
                  <span style={{ fontSize: 11, color: s.done ? T.green : T.muted, background: s.done ? '#f0fdf4' : T.bg, padding: '2px 8px', borderRadius: 99, border: `1px solid ${s.done ? '#bbf7d0' : T.borderLight}`, flexShrink: 0 }}>
                    {s.done ? 'Aangeleverd' : 'Nog te doen'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: '14px 16px', background: T.bg, borderRadius: 7, border: `1px solid ${T.borderLight}`, fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
        Heb je niet alles of weet je iets niet zeker? Geen probleem — wij helpen je verder. Stuur een bericht via Support.
      </div>
    </div>
  )
}
