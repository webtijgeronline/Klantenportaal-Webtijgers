import './globals.css'

export const metadata = {
  title: 'Webtijger CRM',
  description: 'Klantportaal & CRM voor Webtijger',
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
