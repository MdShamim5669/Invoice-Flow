import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/providers/query-provider';

export const metadata: Metadata = {
  title: 'InvoiceFlow — Invoicing & SaaS Management for Freelancers',
  description: 'Manage invoices, clients, expenses, and collect payments via Stripe and SSLCommerz effortlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-[#0b0c13] text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
        {/* Atmospheric Ambient Glow Layer matching reference */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          {/* Top-right warm mauve / plum bloom */}
          <div className="absolute top-[10%] -right-[15%] w-[65vw] h-[65vw] max-w-[850px] max-h-[850px] rounded-full bg-gradient-to-br from-fuchsia-600/15 via-rose-500/10 to-transparent blur-[130px] opacity-0 dark:opacity-100 transition-opacity duration-700" />

          {/* Bottom-right soft magenta / purple bloom */}
          <div className="absolute top-[55%] -right-[10%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full bg-gradient-to-tr from-purple-700/16 via-pink-600/10 to-transparent blur-[140px] opacity-0 dark:opacity-100 transition-opacity duration-700" />

          {/* Top-left subtle indigo ambient glow */}
          <div className="absolute -top-[15%] left-[5%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-br from-indigo-600/10 via-violet-600/6 to-transparent blur-[140px] opacity-0 dark:opacity-100 transition-opacity duration-700" />
        </div>

        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}


