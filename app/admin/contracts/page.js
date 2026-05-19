'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const inputStyle = { padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const tdStyle = { padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#374151' };
const actionBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280', marginRight: '0.5rem' };
const statusColor = { 'signed': '#22c55e', 'pending': '#f59e0b', 'draft': '#6b7280', 'cancelled': '#ef4444' };

export default function AdminContracts() {
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const emptyForm = { client_email: '', title: '', status: 'draft', signed_date: '', file_url: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: c }, { data: cl }] = await Promise.all([
      supabase.from('contracts').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('name, email').order('name'),
    ]);
    setContracts(c || []);
    setClients(cl || []);
    setLoading(false);
  }

  async function save() {
    if (editItem) await supabase.from('contracts').update(form).eq('id', editItem.id);
    else await supabase.from('contracts').insert(form);
    setShowForm(false); setEditItem(null); setForm(emptyForm); fetchAll();
  }

  async function remove(id) {
    if (!confirm('Overeenkomst verwijderen?')) return;
    await supabase.from('contracts').delete().eq('id', id);
    fetchAll();
  }

  function openEdit(c) {
    setEditItem(c);
    setForm({ client_email: c.client_email, title: c.title, status: c.status, signed_date: c.signed_date || '', file_url: c.file_url || '' });
    setShowForm(true);
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Overeenkomsten</h1>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm); }} style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>+ Overeenkomst</button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{editItem ? 'Bewerken' : 'Nieuwe overeenkomst'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <select value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} style={inputStyle}>
              <option value="">Selecteer klant</option>
              {clients.map(c => <option key={c.email} value={c.email}>{c.name}</option>)}
            </select>
            <input placeholder="Titel" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inputStyle} />
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inputStyle}>
              <option value="draft">Draft</option><option value="pending">In afwachting</option><option value="signed">Getekend</option><option value="cancelled">Geannuleerd</option>
            </select>
            <input type="date" value={form.signed_date} onChange={e => setForm({...form, signed_date: e.target.value})} style={inputStyle} />
            <input placeholder="Bestand URL (bijv. Google Drive link)" value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} style={{...inputStyle, gridColumn: '1/-1'}} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={save} style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer' }}>Opslaan</button>
            <button onClick={() => { setShowForm(false); setEditItem(null); }} style={{ background: 'transparent', border: '1px solid #e5e7eb', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer' }}>Annuleren</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: '#6b7280' }}>Laden...</p> : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                {['Klant', 'Titel', 'Status', 'Getekend op', 'Bestand', ''].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}>{c.client_email}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{c.title}</td>
                  <td style={tdStyle}><span style={{ background: (statusColor[c.status] || '#6b7280') + '20', color: statusColor[c.status] || '#6b7280', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500 }}>{c.status}</span></td>
                  <td style={tdStyle}>{c.signed_date ? new Date(c.signed_date).toLocaleDateString('nl-NL') : '—'}</td>
                  <td style={tdStyle}>{c.file_url ? <a href={c.file_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.8rem' }}>Bekijk</a> : '—'}</td>
                  <td style={tdStyle}>
                    <button onClick={() => openEdit(c)} style={actionBtn}>Bewerk</button>
                    <button onClick={() => remove(c.id)} style={{ ...actionBtn, color: '#ef4444' }}>Verwijder</button>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Geen overeenkomsten gevonden</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
