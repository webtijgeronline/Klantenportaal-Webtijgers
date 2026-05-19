'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function PortalFeedback() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState([]);
  const [clientEmail, setClientEmail] = useState('');
  const [form, setForm] = useState({ rating: 5, message: '' });

  useEffect(() => {
    const email = sessionStorage.getItem('clientEmail');
    if (email) { setClientEmail(email); fetchExisting(email); }
  }, []);

  async function fetchExisting(email) {
    const { data } = await supabase.from('feedback').select('*').eq('client_email', email).order('created_at', { ascending: false });
    setExisting(data || []);
  }

  async function submit() {
    if (!form.message.trim()) return;
    setLoading(true);
    await supabase.from('feedback').insert({ client_email: clientEmail, rating: form.rating, message: form.message });
    setSubmitted(true);
    setLoading(false);
    fetchExisting(clientEmail);
  }

  function StarPicker({ value, onChange }) {
    return (
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => onChange(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '2rem', color: n <= value ? '#f59e0b' : '#d1d5db', padding: '0 2px', lineHeight: 1 }}>★</button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Feedback geven</h1>
      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Deel je ervaring met Webtijger. Jouw feedback helpt ons verbeteren.</p>

      {submitted ? (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bedankt!</p>
          <p style={{ color: '#16a34a', fontSize: '0.875rem' }}>Je feedback is ontvangen.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem' }}>Hoe beoordeel je jouw ervaring?</p>
          <StarPicker value={form.rating} onChange={r => setForm({...form, rating: r})} />
          <p style={{ fontSize: '0.875rem', fontWeight: 500, margin: '1.25rem 0 0.5rem' }}>Jouw bericht</p>
          <textarea
            value={form.message}
            onChange={e => setForm({...form, message: e.target.value})}
            placeholder="Schrijf hier je feedback..."
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', minHeight: '120px', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <button onClick={submit} disabled={loading || !form.message.trim()} style={{ marginTop: '1rem', background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.625rem 1.5rem', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: loading || !form.message.trim() ? 0.6 : 1 }}>
            {loading ? 'Versturen...' : 'Feedback versturen'}
          </button>
        </div>
      )}

      {existing.length > 0 && (
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Eerdere feedback</h2>
          {existing.map(f => (
            <div key={f.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= f.rating ? '#f59e0b' : '#e5e7eb' }}>★</span>)}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(f.created_at).toLocaleDateString('nl-NL')}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#374151' }}>{f.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
