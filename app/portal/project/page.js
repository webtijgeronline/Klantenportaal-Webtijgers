'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const ORANGE = '#f97316'

const statusLabel = { 'Not started': 'Niet gestart', 'In progress': 'In Ontwikkeling', 'On hold': 'On hold', 'Completed': 'Afgerond' }
const statusColor = { 'Not started': '#6b7280', 'In progress': ORANGE, 'On hold': '#f59e0b', 'Completed': '#22c55e' }
const progressMap = { 'Not started': 0, 'In progress': 60, 'On hold': 40, 'Completed': 100 }

export default function PortalProject() {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [clientName, setClientName] = useState('')

  useEffect(() => {
    const email = sessionStorage.getItem('clientEmail')
    const user = localStorage.getItem('wt_user')
    if (user) setClientName(JSON.parse(user).name || '')
    if (email) fetchProject(email)
    else setLoading(false)
  }, [])

  async function fetchProject(email) {
    const { data } = await supabase.from('projects').select('*').eq('client_email', email).order('created_at', { ascending: false }).limit(1).single()
    setProject(data || null)
    setLoading(false)
  }

  const progress = project ? (progressMap[project.status] ?? 60) : 0
  const firstName = clientName?.split(' ')[0] || 'daar'

  return (
    <div style={{ padding: '2rem', maxWidth: 760 }}>

      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>Welkom terug, {firstName}</h1>
        <p style={{ color: '#6b7280', marginTop: '0.3rem', fontSize: '0.95rem' }}>Hier is een overzicht van jouw project bij Webtijger.</p>
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Laden...</p>
      ) : !project ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>Er is nog geen project gekoppeld aan jouw account.</p>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Neem contact op via <a href="mailto:info@webtijger.nl" style={{ color: ORANGE }}>info@webtijger.nl</a></p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>

          {/* Orange top accent */}
          <div style={{ height: 4, background: ORANGE }} />

          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, letterSpacing: '-0.3px' }}>{project.name}</h2>
                {project.description && <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.3rem' }}>{project.description}</p>}
              </div>
              <span style={{ background: (statusColor[project.status] || '#6b7280') + '18', color: statusColor[project.status] || '#6b7280', padding: '4px 12px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {statusLabel[project.status] || project.status}
              </span>
            </div>

            {project.deadline && (
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.25rem' }}>
                Deadline: <strong style={{ color: '#374151' }}>{new Date(project.deadline).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </p>
            )}

            {/* Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Voortgang</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: ORANGE }}>{progress}%</span>
              </div>
              <div style={{ background: '#f3f4f6', borderRadius: 999, height: 8 }}>
                <div style={{ background: ORANGE, height: '100%', borderRadius: 999, width: progress + '%', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {project.phase && (
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE, display: 'inline-block' }} />
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>Huidige fase: <strong>{project.phase}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact card */}
      <div style={{ marginTop: '1.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Vragen over je project?</p>
          <p style={{ color: '#6b7280', fontSize: '0.825rem', marginTop: '0.2rem' }}>Webtijger helpt je graag verder.</p>
        </div>
        <a href="mailto:info@webtijger.nl" style={{ background: ORANGE, color: '#fff', padding: '0.5rem 1.1rem', borderRadius: 9, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Contact
        </a>
      </div>
    </div>
  )
}
