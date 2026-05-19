'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const inputStyle = { padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const tdStyle = { padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#374151' };
const actionBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280', marginRight: '0.5rem' };

export default function AdminFiles() {
  const [files, setFiles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const emptyForm = { client_email: '', name: '', file_url: '', category: '', description: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: f }, { data: c }] = await Promise.all([
      supabase.from('shared_files').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('name, email').order('name'),
    ]);
    setFiles(f || []);
    setClients(c || []);
    setLoading(false);
  }

  async function save() {
    if (editItem) await supabase.from('shared_files').update(form).eq('id', editItem.id);
    else await supabase.from('shared_files').insert(form);
    setShowForm(false); setEditItem(null); setForm(emptyForm); fetchAll();
  }

  async function remove(id) {
    if (!confirm('Bestand verwijderen?')) return;
    await supabase.from('shared_files').delete().eq('id', id);
    fetchAll();
  }

  function openEdit(f) {
    setEditItem(f);
    setForm({ client_email: f.client_email, name: f.name, file_url: f.file_url || '', category: f.category || '', description: f.description || '' });
    setShowForm(true);
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Bestanden</h1>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm); }} style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>+ Bestand</button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{editItem ? 'Bewerken' : 'Nieuw bestand delen'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <select value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} style={inputStyle}>
              <option value="">Selecteer klant</option>
              {clients.map(c => <option key={c.email} value={c.email}>{c.name}</option>)}
            </select>
            <input placeholder="Bestandsnaam" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
            <input placeholder="URL (Google Drive, Dropbox, etc.)" value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} style={inputStyle} />
            <input placeholder="Categorie (bijv. Design, Contract)" value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle} />
            <input placeholder="Omschrijving" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{...inputStyle, gridColumn: '1/-1'}} />
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
                {['Klant', 'Naam', 'Categorie', 'Link', ''].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}>{f.client_email}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{f.name}</td>
                  <td style={tdStyle}>{f.category ? <span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem' }}>{f.category}</span> : '—'}</td>
                  <td style={tdStyle}>{f.file_url ? <a href={f.file_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.8rem' }}>Openen</a> : '—'}</td>
                  <td style={tdStyle}>
                    <button onClick={() => openEdit(f)} style={actionBtn}>Bewerk</button>
                    <button onClick={() => remove(f.id)} style={{ ...actionBtn, color: '#ef4444' }}>Verwijder</button>
                  </td>
                </tr>
              ))}
              {files.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Geen bestanden gevonden</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
