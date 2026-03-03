import './globals.css'

export const metadata = {
  title: 'RepCheck.one — Free Luxury Authentication | Spot Fake Designer Items',
  description: 'Authenticate Rolex, Louis Vuitton, Chanel, Jordan, Moncler and 50+ luxury brands. Free database of 1,270+ counterfeit tells from Reddit, expert forums and authentication guides.',
  keywords: 'fake vs real, authentication, legit check, replica, Rolex, Louis Vuitton, Chanel, Jordan, Gucci, Moncler, Stone Island',
  openGraph: {
    title: 'RepCheck.one — The Authentication Standard',
    description: 'Free luxury authentication with 1,270+ tells across 58 brands',
    url: 'https://repcheck.one',
    siteName: 'RepCheck.one',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7175000491834186"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
