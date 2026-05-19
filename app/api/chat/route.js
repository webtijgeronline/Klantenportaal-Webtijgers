export async function POST(req) {
  const { messages } = await req.json()

  const SYSTEM = `Je bent een vriendelijke AI-assistent van Webtijger, een webbureau dat moderne websites bouwt in Framer voor ondernemers en bedrijven die online willen groeien.

Je helpt klanten met:
- Vragen over hun websiteproject (voortgang, deadlines, fases)
- Vragen over Webtijger's diensten (website bouwen in Framer, ontwerp, SEO, hosting)
- Vragen over het klantportaal (hoe werkt aanleveren, bestanden, support tickets)
- Algemene vragen over websitebouw, Framer, online marketing en groeien

Webtijger info:
- Specialisatie: moderne websites in Framer
- Contact: info@webtijger.nl
- Website: webtijger.nl
- Doelgroep: ondernemers en bedrijven die online willen groeien
- Prijzen: op aanvraag, afhankelijk van project omvang

Spreek altijd in het Nederlands. Wees vriendelijk, to-the-point en behulpzaam. Houd antwoorden kort (max 3-4 zinnen tenzij meer detail nodig is). Als je iets niet zeker weet, verwijs naar info@webtijger.nl.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM,
        messages: messages.filter(m => m.role !== 'system'),
      })
    })

    const data = await response.json()
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
