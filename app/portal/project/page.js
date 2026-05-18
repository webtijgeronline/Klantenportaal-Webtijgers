'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const T = { ink: '#0a0a0a', muted: '#9ca3af', subtle: '#6b7280', border: '#e5e7eb', borderLight: '#f3f4f6', surface: '#fff', bg: '#f9fafb', blue: '#2563eb', green: '#16a34a', amber: '#d97706' }

const PROJECT_STATUS = {
  in_development: { label: 'In ontwikkeling', dot: T.blue },
  online: { label: 'Online', dot: T.green },
  paused: { label: 'Gepauzeerd', dot: T.amber },
  maintenance: { label: 'Onderhoud', dot: '#7c3aed' },
}

export default function PortalProject() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('wt_user')
    if (!stored) return
    const { email } = JSON.parse(stored)
    supabase.from('projects').select('*').eq('client_email', email).then(({ data }) => {
      setProjects(data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div style={{ color: T.muted, fontSize: 13 }}>Laden...</div>

  return (
    <div>
      <div style={{ marginBottom: 26 }}>
        <h2 style={{ margin: '0 0 3px', fontSize: 19, fontWeight: 600, color: T.ink, letterSpacing: '-0.4px' }}>Mijn project</h2>
        <p style={{ margin: 0, fontSize: 13, color: T.muted }}>Bekijk de voortgang van jouw website.</p>
      </div>

      {projects.length === 0
        ? <div style={{ padding: '36px 0', textAlign: 'center', fontSize: 13, color: T.muted }}>Er zijn nog geen projecten voor jouw account.</div>
        : projects.map(p => (
          <div key={p.id} style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: '24px 24px 20px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600, color: T.ink, letterSpacing: '-0.3px', marginBottom: 4 }}>{p.name}</div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.subtle }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: PROJECT_STATUS[p.status]?.dot, display: 'inline-block' }} />
                  {PROJECT_STATUS[p.status]?.label}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: T.ink, letterSpacing: '-1px' }}>{p.progress || 0}%</div>
                <div style={{ fontSize: 11, color: T.muted }}>voltooid</div>
              </div>
            </div>
            <div style={{ height: 6, background: T.borderLight, borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ width: `${p.progress || 0}%`, height: '100%', background: p.progress === 100 ? T.green : T.blue, borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: p.url || p.preview_url ? 16 : 0 }}>
              Laatste update: {p.last_update ? new Date(p.last_update).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
            </div>
            {(p.url || p.preview_url) && (
              <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: `1px solid ${T.borderLight}` }}>
                {p.url && <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.blue, textDecoration: 'none', background: '#eff6ff', padding: '6px 14px', borderRadius: 7, border: '1px solid #bfdbfe', fontWeight: 500 }}>Live website bekijken</a>}
                {p.preview_url && <a href={p.preview_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T.subtle, textDecoration: 'none', background: T.bg, padding: '6px 14px', borderRadius: 7, border: `1px solid ${T.border}`, fontWeight: 500 }}>Preview bekijken</a>}
              </div>
            )}
          </div>
        ))
      }
    </div>
  )
}
