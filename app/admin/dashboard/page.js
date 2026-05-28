'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const T = { ink: '#111', muted: '#9ca3af', subtle: '#6b7280', border: '#e5e7eb', light: '#f3f4f6', surface: '#fff', orange: '#f97316' }

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: '18px 20px' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: T.ink, letterSpacing: '-0.5px', marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: T.orange, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState({ projects: [], invoices: [], tickets: [], clients: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: projects }, { data: invoices }, { data: tickets }, { data: clients }] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
      ])
      setData({ projects: projects || [], invoices: invoices || [], tickets: tickets || [], clients: clients || [] })
      setLoading(false)
    }
    load()
  }, [])

  const { projects, invoices, tickets, clients } = data
  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount || 0), 0)
  const unpaid = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + Number(i.amount || 0), 0)
  const openTickets = tickets.filter(t => t.status === 'open').length
  const activeP = projects.filter(p => ['In progress', 'in_development', 'in progress'].includes(p.status)).length

  const statusColor = { 'In progress': T.orange, 'Completed': '#22c55e', 'On hold': '#f59e0b', 'Not started': '#9ca3af' }

  if (loading) return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 20, height: 20, border: `2px solid ${T.orange}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <span style={{ color: T.muted, fontSize: 14 }}>Dashboard laden...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Overzicht</h1>
        <p style={{ color: T.muted, marginTop: '0.3rem', fontSize: '0.9rem' }}>Welkom terug, Ryan.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Klanten" value={clients.length} />
        <StatCard label="Actieve projecten" value={activeP} />
        <StatCard label="Ontvangen" value={`€${paid.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}`} />
        <StatCard label="Openstaand" value={`€${unpaid.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}`} sub={unpaid > 0 ? `${invoices.filter(i => i.status !== 'paid').length} facturen` : ''} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Projecten */}
        <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 14 }}>Recente projecten</p>
          {projects.length === 0 && <p style={{ fontSize: 13, color: T.muted }}>Nog geen projecten</p>}
          {projects.slice(0, 5).map((p, i) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: i > 0 ? `1px solid ${T.light}` : 'none' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{p.name}</p>
                <p style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{p.client_email}</p>
              </div>
              <span style={{ background: (statusColor[p.status] || '#9ca3af') + '18', color: statusColor[p.status] || '#9ca3af', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                {p.status}
              </span>
            </div>
          ))}
        </div>

        {/* Facturen */}
        <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 14 }}>Recente facturen</p>
          {invoices.length === 0 && <p style={{ fontSize: 13, color: T.muted }}>Nog geen facturen</p>}
          {invoices.slice(0, 5).map((inv, i) => (
            <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: i > 0 ? `1px solid ${T.light}` : 'none' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{inv.invoice_number || '—'}</p>
                <p style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{inv.client_email}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontWeight: 700 }}>€{Number(inv.amount || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
                <span style={{ background: inv.status === 'paid' ? '#f0fdf4' : '#fff7ed', color: inv.status === 'paid' ? '#22c55e' : T.orange, padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                  {inv.status === 'paid' ? 'Betaald' : 'Openstaand'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Support tickets */}
        <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: 20, gridColumn: '1/-1' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 14 }}>
            Open support tickets {openTickets > 0 && <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, marginLeft: 6 }}>{openTickets}</span>}
          </p>
          {tickets.filter(t => t.status === 'open').length === 0
            ? <p style={{ fontSize: 13, color: T.muted }}>Geen open tickets</p>
            : tickets.filter(t => t.status === 'open').slice(0, 3).map((t, i) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: i > 0 ? `1px solid ${T.light}` : 'none' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{t.subject}</p>
                  <p style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{t.client_email}</p>
                </div>
                <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>Open</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
