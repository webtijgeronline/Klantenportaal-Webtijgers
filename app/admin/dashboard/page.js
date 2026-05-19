'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const T = { ink: '#0a0a0a', muted: '#9ca3af', subtle: '#6b7280', border: '#e5e7eb', borderLight: '#f3f4f6', surface: '#fff', bg: '#f9fafb', blue: '#2563eb', green: '#16a34a' }

const PROJECT_STATUS = {
  in_development: { label: 'In ontwikkeling', dot: T.blue },
  online: { label: 'Online', dot: T.green },
  paused: { label: 'Gepauzeerd', dot: '#d97706' },
  maintenance: { label: 'Onderhoud', dot: '#7c3aed' },
}
const INVOICE_SM = {
  paid: { label: 'Betaald', color: T.green, bg: '#f0fdf4', border: '#bbf7d0' },
  unpaid: { label: 'Openstaand', color: T.blue, bg: '#eff6ff', border: '#bfdbfe' },
  overdue: { label: 'Verlopen', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

function Pill({ status, map }) {
  const c = map[status] || { label: status, color: T.subtle, bg: T.bg, border: T.border }
  return <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 500, color: c.color, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 99, padding: '3px 9px', whiteSpace: 'nowrap' }}>{c.label}</span>
}

function Bar({ value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 3, background: T.borderLight, borderRadius: 99 }}>
        <div style={{ width: `${value}%`, height: '100%', background: value === 100 ? T.green : T.blue, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 11, color: T.muted, width: 26, textAlign: 'right' }}>{value}%</span>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: '16px 18px' }}>
      <div style={{ fontSize: 21, fontWeight: 600, color: T.ink, letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.muted }}>{label}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState({ projects: [], invoices: [], tickets: [], clients: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
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
  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0)
  const open = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + Number(i.amount), 0)
  const openTickets = tickets.filter(t => t.status === 'open').length
  const activeP = projects.filter(p => p.status === 'in_development').length

  if (loading) return <div style={{ color: T.muted, fontSize: 13 }}>Laden...</div>

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: 26 }}>
        <h2 style={{ margin: '0 0 3px', fontSize: 28, fontWeight: 800, color: T.ink, letterSpacing: '-0.5px' }}>Overzicht</h2>
        <p style={{ margin: 0, fontSize: 14, color: T.muted }}>Welkom terug, Ryan.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 24 }}>
        <StatCard label="Actieve projecten" value={activeP} />
        <StatCard label="Klanten" value={clients.length} />
        <StatCard label="Omzet ontvangen" value={`€\u202f${paid.toLocaleString('nl')}`} />
        <StatCard label="Openstaand" value={`€\u202f${open.toLocaleString('nl')}`} />
        <StatCard label="Open tickets" value={openTickets} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: T.subtle, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Projecten</div>
          {projects.slice(0,5).map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.ink, marginBottom: 5 }}>{p.name}</div>
                <Bar value={p.progress || 0} />
              </div>
              <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.muted, flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: PROJECT_STATUS[p.status]?.dot, display: 'inline-block' }} />
                {PROJECT_STATUS[p.status]?.label}
              </span>
            </div>
          ))}
        </div>

        <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: T.subtle, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Facturen</div>
          {invoices.slice(0,5).map((inv, i) => (
            <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: i > 0 ? `1px solid ${T.borderLight}` : 'none' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.ink }}>{inv.number}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{inv.client_name}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.ink }}>€\u202f{Number(inv.amount).toLocaleString('nl')}</span>
                <Pill status={inv.status} map={INVOICE_SM} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
