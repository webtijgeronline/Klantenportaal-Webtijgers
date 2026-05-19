'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const ORANGE = '#f97316'

export default function PortalFiles() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email = sessionStorage.getItem('clientEmail')
    if (email) fetchFiles(email)
    else setLoading(false)
  }, [])

  async function fetchFiles(email) {
    const { data } = await supabase.from('shared_files').select('*').eq('client_email', email).order('created_at', { ascending: false })
    setFiles(data || [])
    setLoading(false)
  }

  const grouped = files.reduce((acc, f) => {
    const cat = f.category || 'Overig'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(f)
    return acc
  }, {})

  return (
    <div style={{ padding: '2rem', maxWidth: 700 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>Bestanden</h1>
      <p style={{ color: '#6b7280', marginTop: '0.3rem', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
        Bestanden gedeeld door Webtijger.
      </p>

      {loading ? <p style={{ color: '#6b7280' }}>Laden...</p> : Object.keys(grouped).length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</p>
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Geen bestanden gevonden</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Webtijger deelt hier bestanden zodra ze beschikbaar zijn.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(grouped).map(([cat, catFiles]) => (
            <div key={cat}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>{cat}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {catFiles.map(f => (
                  <div key={f.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📄</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.name}</p>
                        {f.description && <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 1 }}>{f.description}</p>}
                      </div>
                    </div>
                    {f.file_url && (
                      <a href={f.file_url} target="_blank" rel="noreferrer"
                        style={{ background: '#0f0f0f', color: '#fff', padding: '0.45rem 1rem', borderRadius: 9, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
                        Openen
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
