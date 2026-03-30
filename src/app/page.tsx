import Link from 'next/link';
import {
  FileText,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Download,
  Globe,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const features = [
  {
    icon: Users,
    title: 'Client Management',
    description:
      'Keep all your client details organized in one place. Easy CRUD operations.',
  },
  {
    icon: FileText,
    title: 'Professional Invoices',
    description:
      'Create detailed invoices with line items, auto-calculated totals, and custom branding.',
  },
  {
    icon: Download,
    title: 'PDF Generation',
    description:
      'Generate polished PDF invoices with your logo, ready to send to clients.',
  },
  {
    icon: Globe,
    title: 'Public Invoice Links',
    description:
      'Share invoices via unique public URLs. Clients can view without signing up.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description:
      'Row-level security ensures your data is only accessible by you. Always.',
  },
  {
    icon: Zap,
    title: 'Fast & Modern',
    description:
      'Built with Next.js and Supabase for blazing-fast performance and real-time data.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-light-50 dark:bg-dark-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-light-200 dark:border-dark-700">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="text-orange-brand" size={24} />
            <span className="text-xl font-bold text-dark-800 dark:text-light-50">
              InVoices
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-dark-700 dark:text-light-300 hover:text-orange-brand transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-brand hover:bg-orange-hover text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-brand/10 text-orange-brand text-sm font-medium mb-6">
              <Zap size={14} />
              Built for developers & freelancers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark-800 dark:text-light-50 leading-tight">
              Invoicing that{' '}
              <span className="text-orange-brand">just works</span>
            </h1>
            <p className="mt-6 text-lg text-dark-700 dark:text-light-300 max-w-2xl mx-auto">
              Stop wrestling with spreadsheets. Create professional invoices,
              manage clients, and generate PDFs — all from a clean, modern
              dashboard.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-brand hover:bg-orange-hover text-white font-medium rounded-lg transition-colors shadow-lg shadow-orange-brand/20"
              >
                Start for Free
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-800 text-dark-800 dark:text-light-50 font-medium rounded-lg border border-light-200 dark:border-dark-700 hover:bg-light-100 dark:hover:bg-dark-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Gradient decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-orange-brand/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-dark-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-800 dark:text-light-50">
              Everything you need
            </h2>
            <p className="mt-3 text-dark-700 dark:text-light-300">
              A complete invoicing toolkit, purpose-built for independent
              developers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-light-200 dark:border-dark-700 hover:border-orange-brand/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-brand/10 flex items-center justify-center mb-4 group-hover:bg-orange-brand/20 transition-colors">
                  <feature.icon size={20} className="text-orange-brand" />
                </div>
                <h3 className="text-lg font-semibold text-dark-800 dark:text-light-50 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-dark-700 dark:text-light-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-dark-800 dark:text-light-50">
            Ready to simplify your invoicing?
          </h2>
          <p className="mt-3 text-dark-700 dark:text-light-300">
            Join developers who&apos;ve ditched the spreadsheet chaos.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-brand hover:bg-orange-hover text-white font-semibold rounded-lg transition-colors shadow-lg shadow-orange-brand/20 text-lg"
            >
              Create Free Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-light-200 dark:border-dark-700 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="text-orange-brand" size={18} />
            <span className="font-semibold text-dark-800 dark:text-light-50">
              InVoices
            </span>
          </div>
          <p className="text-sm text-dark-700 dark:text-light-300">
            &copy; {new Date().getFullYear()} InVoices. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
