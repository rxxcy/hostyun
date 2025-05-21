import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import type { LinksFunction, MetaFunction } from '@remix-run/node'

import './tailwind.css'

export const meta: MetaFunction = () => {
  return [
    { title: 'Hostyun VPS库存监控' },
    { name: 'description', content: '实时监控Hostyun的VPS库存和价格信息' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ]
}

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
