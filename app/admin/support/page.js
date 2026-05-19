'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const tdStyle = { padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#374151' };
const statusColor = { 'open': '#ef4444', 'in_progress': '#f59e0b', 'resolved': '#22c55e', 'closed': '#6b7280' };
const priorityColor = { 'low': '#6b7280', 'medium': '#f59e0b', 'high': '#ef4444', 'urgent': '#dc2626' };

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await supabase.from('support_tickets').update({ status }).eq('id', id);
    if (selected?.id === id) setSelected({ ...selected, status });
    fetchAll();
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Support tickets</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'open', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: '0.35rem 0.875rem', borderRadius: '999px', border: '1px solid #e5e7eb', background: filter === s ? '#0f0f0f' : '#fff', color: filter === s ? '#fff' : '#374151', cursor: 'pointer', fontSize: '0.8rem' }}>
              {s === 'all' ? 'Alle' : s === 'in_progress' ? 'In behandeling' : s === 'open' ? 'Open' : 'Opgelost'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          {loading ? <p style={{ padding: '2rem', color: '#6b7280' }}>Laden...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  {['Klant', 'Onderwerp', 'Prioriteit', 'Status', 'Datum', ''].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} onClick={() => setSelected(t)} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: selected?.id === t.id ? '#f9fafb' : 'transparent' }}>
                    <td style={tdStyle}>{t.client_email}</td>
                    <td style={{ ...tdStyle, fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</td>
                    <td style={tdStyle}><span style={{ color: priorityColor[t.priority] || '#6b7280', fontWeight: 500, fontSize: '0.8rem' }}>{t.priority || '—'}</span></td>
                    <td style={tdStyle}><span style={{ background: (statusColor[t.status] || '#6b7280') + '20', color: statusColor[t.status] || '#6b7280', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500 }}>{t.status}</span></td>
                    <td style={tdStyle}>{new Date(t.created_at).toLocaleDateString('nl-NL')}</td>
                    <td style={tdStyle}>
                      <select value={t.status} onChange={e => { e.stopPropagation(); updateStatus(t.id, e.target.value); }} style={{ padding: '0.25rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <option value="open">Open</option><option value="in_progress">In behandeling</option><option value="resolved">Opgelost</option><option value="closed">Gesloten</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Geen tickets gevonden</td></tr>}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Detail</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '1.2rem' }}>×</button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Van</p>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>{selected.client_email}</p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Onderwerp</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem' }}>{selected.subject}</p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Bericht</p>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, background: '#f9fafb', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{selected.message}</p>
            <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Interne notitie..." style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }} />
            <button style={{ marginTop: '0.5rem', background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', width: '100%' }}>Notitie opslaan</button>
          </div>
        )}
      </div>
    </div>
  );
}
