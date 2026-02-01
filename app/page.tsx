import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Activity, Users, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white dark:bg-slate-900 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Activity className="h-6 w-6" />
          <span>ClinicSaaS</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underlines-offset-4 flex items-center">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4 flex items-center">
            Pricing
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white dark:bg-slate-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                  Manage Your Clinic with Ease
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  The all-in-one platform for modern healthcare providers. Schedule appointments, manage patients, and track revenue—all in one secure place.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button size="lg" className="h-12 px-8">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-12 px-8">Sign In</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-950">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">Everything You Need</h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                <Users className="h-10 w-10 text-blue-500" />
                <h3 className="text-xl font-bold">Patient Records</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Securely store and access patient history, visits, and documents from anywhere.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                <Activity className="h-10 w-10 text-green-500" />
                <h3 className="text-xl font-bold">Smart Scheduling</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Efficient calendar management to reduce no-shows and optimize your day.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                <CreditCard className="h-10 w-10 text-purple-500" />
                <h3 className="text-xl font-bold">Billing & Invoices</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generate professional invoices and track payments with ease.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security / Trust */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-slate-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter">Enterprise-Grade Security</h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Your patient data is protected with state-of-the-art encryption and strict data isolation.
                </p>
                <ul className="grid gap-4 mt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>HIPAA Compliant Architecture</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Encrypted at Rest & in Transit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Daily Backups</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <Shield className="h-64 w-64 text-slate-200 dark:text-slate-800" strokeWidth={1} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white dark:bg-slate-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 ClinicSaaS Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
