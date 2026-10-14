import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * قالب HTML للويب فقط (يُستخدم أثناء التصدير الثابت وفي وضع التطوير).
 * نضبط هنا اتجاه الصفحة للعربية (RTL) ولون الثيم.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0F9D7A" />
        <title>واصل — توصيل الطلبات</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: webStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const webStyles = `
  html, body { direction: rtl; background-color: #F7F8FA; }
  body { -webkit-font-smoothing: antialiased; font-family: 'Cairo_400Regular', system-ui, sans-serif; }
  /* تمرير أنعم وبدون أشرطة تمرير ظاهرة على الديسكتوب */
  * { scrollbar-width: thin; scrollbar-color: #D1D5DB transparent; }
  input, textarea { outline: none; }
`;
