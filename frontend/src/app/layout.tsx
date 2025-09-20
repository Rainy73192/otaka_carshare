import './globals.css'
import './ios-fixes.css'

export const metadata = {
  title: 'Otaka 租车系统',
  description: '安全便捷的租车管理系统',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Otaka 租车" />
        <meta name="theme-color" content="#22c55e" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}