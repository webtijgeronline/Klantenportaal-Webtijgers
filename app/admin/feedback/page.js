'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const tdStyle = { padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#374151' };

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    setFeedback(data || []);
    setLoading(false);
  }

  async function remove(id) {
    if (!confirm('Feedback verwijderen?')) return;
    await supabase.from('feedback').delete().eq('id', id);
    fetchAll();
  }

  function stars(rating) {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#f59e0b' : '#e5e7eb', fontSize: '1rem' }}>★</span>
    ));
  }

  const avg = feedback.length ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1) : '—';

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Feedback</h1>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>★</span>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{avg}</span>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>gemiddeld ({feedback.length})</span>
        </div>
      </div>

      {loading ? <p style={{ color: '#6b7280' }}>Laden...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {feedback.map(f => (
            <div key={f.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{f.client_email}</p>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '0.75rem' }}>{stars(f.rating || 0)}</div>
                  {f.message && <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>{f.message}</p>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(f.created_at).toLocaleDateString('nl-NL')}</p>
                  <button onClick={() => remove(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem' }}>Verwijder</button>
                </div>
              </div>
            </div>
          ))}
          {feedback.length === 0 && <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Nog geen feedback ontvangen</div>}
        </div>
      )}
    </div>
  );
}
