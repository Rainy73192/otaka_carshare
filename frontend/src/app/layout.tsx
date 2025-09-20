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
              // 修复被动事件监听器问题
              (function() {
                // 重写addEventListener方法
                const originalAddEventListener = EventTarget.prototype.addEventListener;
                EventTarget.prototype.addEventListener = function(type, listener, options) {
                  if (type === 'touchstart' || type === 'touchmove' || type === 'touchend' || 
                      type === 'wheel' || type === 'scroll') {
                    if (typeof options === 'object' && options !== null) {
                      options = { ...options, passive: false };
                    } else if (options === undefined) {
                      options = { passive: false };
                    }
                  }
                  return originalAddEventListener.call(this, type, listener, options);
                };

                // 重写preventDefault方法
                const originalPreventDefault = Event.prototype.preventDefault;
                Event.prototype.preventDefault = function() {
                  if (this.cancelable === false) {
                    console.warn('Attempted to call preventDefault() on a passive event, ignoring...');
                    return;
                  }
                  return originalPreventDefault.call(this);
                };

                // 确保所有触摸事件都不是被动的
                ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(eventType => {
                  document.addEventListener(eventType, function() {}, { passive: false, capture: true });
                  document.addEventListener(eventType, function() {}, { passive: false, capture: false });
                });

                console.log('Passive event listener fix applied');
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}