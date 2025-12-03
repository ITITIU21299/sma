import { Montserrat, Roboto } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
})

export const metadata = {
  title: 'School Management System',
  description: 'Modern School Management System built with Next.js and React',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          montserrat.variable,
          roboto.variable,
          'antialiased min-h-screen'
        )}
      >
        {children}
      </body>
    </html>
  )
}
