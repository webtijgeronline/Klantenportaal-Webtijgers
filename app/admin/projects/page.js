'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const inputStyle = { padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const tdStyle = { padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#374151' };
const actionBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280', marginRight: '0.5rem' };
const statusColor = { 'In progress': '#f59e0b', 'Completed': '#22c55e', 'On hold': '#6b7280', 'Not started': '#3b82f6' };

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const emptyForm = { client_email: '', name: '', status: 'In progress', phase: '', start_date: '', deadline: '', description: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('name, email').order('name'),
    ]);
    setProjects(p || []);
    setClients(c || []);
    setLoading(false);
  }

  async function save() {
    if (editItem) await supabase.from('projects').update(form).eq('id', editItem.id);
    else await supabase.from('projects').insert(form);
    setShowForm(false); setEditItem(null); setForm(emptyForm); fetchAll();
  }

  async function remove(id) {
    if (!confirm('Project verwijderen?')) return;
    await supabase.from('projects').delete().eq('id', id);
    fetchAll();
  }

  function openEdit(p) {
    setEditItem(p);
    setForm({ client_email: p.client_email, name: p.name, status: p.status, phase: p.phase || '', start_date: p.start_date || '', deadline: p.deadline || '', description: p.description || '' });
    setShowForm(true);
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Projecten</h1>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm); }} style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>+ Project</button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{editItem ? 'Bewerken' : 'Nieuw project'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <select value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} style={inputStyle}>
              <option value="">Selecteer klant</option>
              {clients.map(c => <option key={c.email} value={c.email}>{c.name}</option>)}
            </select>
            <input placeholder="Projectnaam" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inputStyle}>
              <option>Not started</option><option>In progress</option><option>On hold</option><option>Completed</option>
            </select>
            <input placeholder="Fase (bijv. Design)" value={form.phase} onChange={e => setForm({...form, phase: e.target.value})} style={inputStyle} />
            <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} style={inputStyle} />
            <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} style={inputStyle} />
            <textarea placeholder="Omschrijving" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{...inputStyle, gridColumn: '1/-1', minHeight: '80px', resize: 'vertical'}} />
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
                {['Klant', 'Project', 'Status', 'Fase', 'Deadline', ''].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}>{p.client_email}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{p.name}</td>
                  <td style={tdStyle}><span style={{ background: (statusColor[p.status] || '#6b7280') + '20', color: statusColor[p.status] || '#6b7280', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500 }}>{p.status}</span></td>
                  <td style={tdStyle}>{p.phase || '—'}</td>
                  <td style={tdStyle}>{p.deadline ? new Date(p.deadline).toLocaleDateString('nl-NL') : '—'}</td>
                  <td style={tdStyle}>
                    <button onClick={() => openEdit(p)} style={actionBtn}>Bewerk</button>
                    <button onClick={() => remove(p.id)} style={{ ...actionBtn, color: '#ef4444' }}>Verwijder</button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Geen projecten gevonden</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
