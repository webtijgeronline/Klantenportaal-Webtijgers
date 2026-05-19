'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const inputStyle = { padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const tdStyle = { padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#374151' };
const actionBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280', marginRight: '0.5rem' };
const statusColor = { 'paid': '#22c55e', 'unpaid': '#f59e0b', 'overdue': '#ef4444', 'draft': '#6b7280' };

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const emptyForm = { client_email: '', invoice_number: '', amount: '', status: 'unpaid', due_date: '', description: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: inv }, { data: c }] = await Promise.all([
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('name, email').order('name'),
    ]);
    setInvoices(inv || []);
    setClients(c || []);
    setLoading(false);
  }

  async function save() {
    const data = { ...form, amount: parseFloat(form.amount) || 0 };
    if (editItem) await supabase.from('invoices').update(data).eq('id', editItem.id);
    else await supabase.from('invoices').insert(data);
    setShowForm(false); setEditItem(null); setForm(emptyForm); fetchAll();
  }

  async function remove(id) {
    if (!confirm('Factuur verwijderen?')) return;
    await supabase.from('invoices').delete().eq('id', id);
    fetchAll();
  }

  function openEdit(inv) {
    setEditItem(inv);
    setForm({ client_email: inv.client_email, invoice_number: inv.invoice_number || '', amount: inv.amount || '', status: inv.status, due_date: inv.due_date || '', description: inv.description || '' });
    setShowForm(true);
  }

  const total = invoices.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const unpaid = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Facturen</h1>
        <button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm); }} style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>+ Factuur</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Totaal gefactureerd</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>€{total.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Openstaand</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>€{unpaid.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{editItem ? 'Bewerken' : 'Nieuwe factuur'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <select value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} style={inputStyle}>
              <option value="">Selecteer klant</option>
              {clients.map(c => <option key={c.email} value={c.email}>{c.name}</option>)}
            </select>
            <input placeholder="Factuurnummer" value={form.invoice_number} onChange={e => setForm({...form, invoice_number: e.target.value})} style={inputStyle} />
            <input placeholder="Bedrag (bijv. 1500)" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} style={inputStyle} />
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inputStyle}>
              <option value="draft">Draft</option><option value="unpaid">Onbetaald</option><option value="paid">Betaald</option><option value="overdue">Verlopen</option>
            </select>
            <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} style={inputStyle} />
            <input placeholder="Omschrijving" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={inputStyle} />
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
                {['Klant', 'Nummer', 'Bedrag', 'Status', 'Vervaldatum', ''].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}>{inv.client_email}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{inv.invoice_number || '—'}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>€{parseFloat(inv.amount || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</td>
                  <td style={tdStyle}><span style={{ background: (statusColor[inv.status] || '#6b7280') + '20', color: statusColor[inv.status] || '#6b7280', padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500 }}>{inv.status}</span></td>
                  <td style={tdStyle}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('nl-NL') : '—'}</td>
                  <td style={tdStyle}>
                    <button onClick={() => openEdit(inv)} style={actionBtn}>Bewerk</button>
                    <button onClick={() => remove(inv.id)} style={{ ...actionBtn, color: '#ef4444' }}>Verwijder</button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Geen facturen gevonden</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
