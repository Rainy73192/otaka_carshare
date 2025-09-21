import './globals.css'
import './ios-fixes.css'
import '@/lib/eventFix'
import { Toaster } from 'react-hot-toast'

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 轻量级移动端优化
              (function() {
                // 只修复滚动相关的被动事件监听器问题
                const originalAddEventListener = EventTarget.prototype.addEventListener;
                EventTarget.prototype.addEventListener = function(type, listener, options) {
                  if (type === 'touchmove' || type === 'wheel' || type === 'scroll') {
                    if (typeof options === 'object' && options !== null) {
                      options = { ...options, passive: false };
                    } else if (options === undefined) {
                      options = { passive: false };
                    }
                  }
                  return originalAddEventListener.call(this, type, listener, options);
                };

                console.log('Mobile optimization applied');
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          containerStyle={{
            top: '20px',
            zIndex: 9999,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(0, 0, 0, 0.9)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              fontSize: '16px',
              fontWeight: '500',
              padding: '12px 20px',
              maxWidth: '90vw',
              wordBreak: 'break-word',
            },
            success: {
              duration: 3000,
              style: {
                background: 'rgba(34, 197, 94, 0.95)',
                color: '#fff',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(34, 197, 94, 0.4)',
                fontSize: '16px',
                fontWeight: '500',
                padding: '12px 20px',
                maxWidth: '90vw',
                wordBreak: 'break-word',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#22c55e',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: 'rgba(239, 68, 68, 0.95)',
                color: '#fff',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)',
                fontSize: '16px',
                fontWeight: '500',
                padding: '12px 20px',
                maxWidth: '90vw',
                wordBreak: 'break-word',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
          }}
        />
      </body>
    </html>
  )
}