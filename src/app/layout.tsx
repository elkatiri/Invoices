import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InVoices — Developer Invoicing Platform",
  description:
    "Simple, beautiful invoicing for developers and freelancers. Manage clients, generate professional invoices, and get paid faster.",
  keywords: ["invoicing", "developer", "freelancer", "invoice generator", "SaaS"],
  openGraph: {
    title: "InVoices — Developer Invoicing Platform",
    description:
      "Simple, beautiful invoicing for developers and freelancers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="InVoices Team" />
        <meta name="keywords" content="invoicing, developer, freelancer, invoice generator, SaaS, billing, payments, clients, business, finance" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="InVoices — Developer Invoicing Platform" />
        <meta property="og:description" content="Simple, beautiful invoicing for developers and freelancers." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://invoices.dev/" />
        <meta property="og:site_name" content="InVoices" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="InVoices — Developer Invoicing Platform" />
        <meta name="twitter:description" content="Simple, beautiful invoicing for developers and freelancers." />
        <meta name="twitter:image" content="/og-image.png" />
        <meta name="twitter:site" content="@invoicesapp" />
        <link rel="canonical" href="https://invoices.dev/" />
        <link rel="icon" href="/favicon.ico" />
        {/* Theme/Locale Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
                const l = localStorage.getItem('locale');
                if (l === 'ar') {
                  document.documentElement.lang = 'ar';
                  document.documentElement.dir = 'rtl';
                } else if (l === 'fr') {
                  document.documentElement.lang = 'fr';
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
