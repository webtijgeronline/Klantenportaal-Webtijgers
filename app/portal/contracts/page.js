'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const statusColor = { 'signed': '#22c55e', 'pending': '#f59e0b', 'draft': '#6b7280', 'cancelled': '#ef4444' };
const statusLabel = { 'signed': 'Getekend', 'pending': 'In afwachting', 'draft': 'Concept', 'cancelled': 'Geannuleerd' };

export default function PortalContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientEmail, setClientEmail] = useState('');

  useEffect(() => {
    const email = sessionStorage.getItem('clientEmail');
    if (email) { setClientEmail(email); fetchContracts(email); }
    else setLoading(false);
  }, []);

  async function fetchContracts(email) {
    const { data } = await supabase.from('contracts').select('*').eq('client_email', email).order('created_at', { ascending: false });
    setContracts(data || []);
    setLoading(false);
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Overeenkomsten</h1>

      {loading ? <p style={{ color: '#6b7280' }}>Laden...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {contracts.map(c => (
            <div key={c.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{c.title}</p>
                {c.signed_date && <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Getekend op {new Date(c.signed_date).toLocaleDateString('nl-NL')}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ background: (statusColor[c.status] || '#6b7280') + '20', color: statusColor[c.status] || '#6b7280', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500 }}>
                  {statusLabel[c.status] || c.status}
                </span>
                {c.file_url && (
                  <a href={c.file_url} target="_blank" rel="noreferrer" style={{ background: '#0f0f0f', color: '#fff', padding: '0.4rem 0.875rem', borderRadius: '8px', fontSize: '0.8rem', textDecoration: 'none' }}>Bekijken</a>
                )}
              </div>
            </div>
          ))}
          {contracts.length === 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Er zijn nog geen overeenkomsten voor je account.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
