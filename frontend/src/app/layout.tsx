import './globals.css'

export const metadata = {
  title: 'Otaka 租车系统',
  description: '安全便捷的租车管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  )
}