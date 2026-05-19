import './globals.css'

export const metadata = {
  title: 'Webtijger Klantportaal',
  description: 'Jouw persoonlijke portaal bij Webtijger',
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
