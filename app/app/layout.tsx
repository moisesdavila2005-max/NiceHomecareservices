import WhatsAppFloat from './components/WhatsAppFloat'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  )
}