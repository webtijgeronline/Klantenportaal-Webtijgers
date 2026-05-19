'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

const ORANGE = '#f97316'

const SYSTEM_PROMPT = `Je bent een vriendelijke AI-assistent van Webtijger, een webbureau dat moderne websites bouwt in Framer voor ondernemers en bedrijven die online willen groeien.

Je helpt klanten met:
- Vragen over hun websiteproject (voortgang, deadlines, fases)
- Vragen over Webtijger's diensten (website bouwen in Framer, ontwerp, SEO, hosting)
- Vragen over het klantportaal (hoe werkt aanleveren, bestanden, support)
- Algemene vragen over websitebouw, Framer, online groeien

Webtijger info:
- Specialisatie: moderne websites in Framer
- Contact: info@webtijger.nl
- Website: webtijger.nl
- Doelgroep: ondernemers en bedrijven die online willen groeien
- Prijzen: op aanvraag, afhankelijk van project

Spreek altijd in het Nederlands. Wees vriendelijk, kort en behulpzaam. Als je iets niet weet, verwijs naar info@webtijger.nl.`

export default function ChatBot({ userName }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hoi${userName ? ' ' + userName.split(' ')[0] : ''}! Ik ben de AI-assistent van Webtijger. Hoe kan ik je helpen?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Sorry, ik kon geen antwoord genereren.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (!open) setUnread(u => u + 1)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Er is iets misgegaan. Probeer het opnieuw of mail naar info@webtijger.nl.' }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 20, width: 340, height: 480,
          background: '#fff', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', zIndex: 1000,
          border: '1px solid #e5e7eb', overflow: 'hidden',
          fontFamily: "'DM Sans', sans-serif"
        }}>
          {/* Header */}
          <div style={{ background: '#0f0f0f', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
              <Image src="/mascotte.png" alt="Webtijger assistent" fill style={{ objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0 }}>Webtijger Assistent</p>
              <p style={{ color: '#22c55e', fontSize: 11, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                Online
              </p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, background: '#faf9f7' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 24, height: 24, flexShrink: 0, position: 'relative' }}>
                    <Image src="/mascotte.png" alt="" fill style={{ objectFit: 'contain' }} />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%', padding: '8px 12px', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: m.role === 'user' ? ORANGE : '#fff',
                  color: m.role === 'user' ? '#fff' : '#1f2937',
                  fontSize: 13.5, lineHeight: 1.5,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  border: m.role === 'assistant' ? '1px solid #e5e7eb' : 'none'
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ width: 24, height: 24, position: 'relative', flexShrink: 0 }}>
                  <Image src="/mascotte.png" alt="" fill style={{ objectFit: 'contain' }} />
                </div>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '8px 14px', borderRadius: '12px 12px 12px 2px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#d1d5db', display: 'inline-block', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #e5e7eb', background: '#fff', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Stel een vraag..."
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13.5, outline: 'none', fontFamily: 'inherit', background: '#faf9f7' }}
            />
            <button onClick={send} disabled={loading || !input.trim()} style={{ background: ORANGE, border: 'none', borderRadius: 9, padding: '8px 14px', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 13, opacity: loading || !input.trim() ? 0.5 : 1 }}>
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 20, right: 20, width: 58, height: 58,
          borderRadius: '50%', background: '#0f0f0f', border: 'none',
          cursor: 'pointer', zIndex: 1000, padding: 0, overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
        {open ? (
          <span style={{ color: '#fff', fontSize: 22 }}>×</span>
        ) : (
          <div style={{ position: 'relative', width: 44, height: 44 }}>
            <Image src="/mascotte.png" alt="Chat" fill style={{ objectFit: 'contain' }} />
          </div>
        )}
        {!open && unread > 0 && (
          <span style={{ position: 'absolute', top: 4, right: 4, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  )
}
