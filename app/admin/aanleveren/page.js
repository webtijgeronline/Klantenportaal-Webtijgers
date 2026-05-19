'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const tdStyle = { padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#374151' };

const SECTIONS = [
  { key: 'logo_branding', label: 'Logo & Branding' },
  { key: 'fotos', label: "Foto's" },
  { key: 'website_teksten', label: 'Website teksten' },
  { key: 'bedrijfsinformatie', label: 'Bedrijfsinformatie' },
  { key: 'inspiratie', label: 'Inspiratie & Voorbeelden' },
  { key: 'documenten', label: 'Documenten' },
  { key: 'website_bestanden', label: 'Website bestanden' },
];

export default function AdminAanleveren() {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('all');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: a }, { data: c }] = await Promise.all([
      supabase.from('aanleveren').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('name, email').order('name'),
    ]);
    setItems(a || []);
    setClients(c || []);
    setLoading(false);
  }

  async function updateDriveFolder(id, url) {
    await supabase.from('aanleveren').update({ drive_folder: url }).eq('id', id);
    fetchAll();
  }

  const filtered = selectedClient === 'all' ? items : items.filter(i => i.client_email === selectedClient);

  function completionPercent(item) {
    const done = SECTIONS.filter(s => item[s.key]).length;
    return Math.round((done / SECTIONS.length) * 100);
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Aanleveren overzicht</h1>
        <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}>
          <option value="all">Alle klanten</option>
          {clients.map(c => <option key={c.email} value={c.email}>{c.name}</option>)}
        </select>
      </div>

      {loading ? <p style={{ color: '#6b7280' }}>Laden...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(item => {
            const pct = completionPercent(item);
            const client = clients.find(c => c.email === item.client_email);
            return (
              <div key={item.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{client?.name || item.client_email}</p>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.client_email}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: pct === 100 ? '#22c55e' : pct > 50 ? '#f59e0b' : '#ef4444' }}>{pct}%</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{SECTIONS.filter(s => item[s.key]).length}/{SECTIONS.length} compleet</p>
                  </div>
                </div>

                <div style={{ background: '#f3f4f6', borderRadius: '999px', height: '6px', marginBottom: '1rem' }}>
                  <div style={{ background: pct === 100 ? '#22c55e' : '#0f0f0f', height: '100%', borderRadius: '999px', width: `${pct}%`, transition: 'width 0.3s' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                  {SECTIONS.map(s => (
                    <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: item[s.key] ? '#22c55e' : '#9ca3af' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item[s.key] ? '#22c55e' : '#d1d5db', flexShrink: 0 }} />
                      {s.label}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    defaultValue={item.drive_folder || ''}
                    placeholder="Google Drive map URL..."
                    style={{ flex: 1, padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.8rem', outline: 'none' }}
                    id={`drive-${item.id}`}
                  />
                  <button
                    onClick={() => updateDriveFolder(item.id, document.getElementById(`drive-${item.id}`).value)}
                    style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.4rem 0.875rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    Opslaan
                  </button>
                  {item.drive_folder && (
                    <a href={item.drive_folder} target="_blank" rel="noreferrer" style={{ background: '#f3f4f6', border: 'none', padding: '0.4rem 0.875rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'none', color: '#374151', whiteSpace: 'nowrap' }}>Drive openen</a>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Geen aanleveren-records gevonden</div>}
        </div>
      )}
    </div>
  );
}
