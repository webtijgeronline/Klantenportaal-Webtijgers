'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function PortalFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = sessionStorage.getItem('clientEmail');
    if (email) fetchFiles(email);
    else setLoading(false);
  }, []);

  async function fetchFiles(email) {
    const { data } = await supabase.from('shared_files').select('*').eq('client_email', email).order('created_at', { ascending: false });
    setFiles(data || []);
    setLoading(false);
  }

  const grouped = files.reduce((acc, f) => {
    const cat = f.category || 'Overig';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Gedeelde bestanden</h1>

      {loading ? <p style={{ color: '#6b7280' }}>Laden...</p> : (
        Object.keys(grouped).length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            Er zijn nog geen bestanden gedeeld.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.entries(grouped).map(([cat, catFiles]) => (
              <div key={cat}>
                <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>{cat}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {catFiles.map(f => (
                    <div key={f.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{f.name}</p>
                        {f.description && <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.1rem' }}>{f.description}</p>}
                      </div>
                      {f.file_url && (
                        <a href={f.file_url} target="_blank" rel="noreferrer" style={{ background: '#0f0f0f', color: '#fff', padding: '0.4rem 0.875rem', borderRadius: '8px', fontSize: '0.8rem', textDecoration: 'none', flexShrink: 0 }}>Openen</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
