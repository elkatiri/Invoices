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
