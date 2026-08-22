import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export const metadata: Metadata = {
  title: 'Dayflow — Every workday, perfectly aligned',
  description: 'Modern Human Resource Management System',
};

const extensionBlockerScript = `(function(){
  try {
    // 1. Filter out third-party extension hydration mismatch logs in dev console
    var origError = console.error;
    console.error = function() {
      var args = Array.prototype.slice.call(arguments);
      var msg = args.join(' ');
      if (
        msg.indexOf('bis_skin_checked') !== -1 ||
        msg.indexOf('bis_register') !== -1 ||
        msg.indexOf('fdprocessedid') !== -1 ||
        msg.indexOf('__processed_') !== -1
      ) {
        return; // Suppress false-positive browser extension warnings
      }
      return origError.apply(console, args);
    };

    // 2. Prevent extensions from adding attribute mutations to DOM
    var origSet = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
      if (
        name === 'bis_skin_checked' ||
        name === 'bis_register' ||
        name === 'fdprocessedid' ||
        name.indexOf('__processed_') === 0
      ) {
        return;
      }
      return origSet.call(this, name, value);
    };
  } catch(e) {}
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: extensionBlockerScript }} />
      </head>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <TooltipProvider>
          {children}
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </body>
    </html>
  );
}
