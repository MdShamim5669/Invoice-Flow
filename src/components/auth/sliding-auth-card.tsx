'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn, signUp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Standalone SVG Icons
const GithubIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

type SocialProvider = 'google' | 'github' | 'facebook' | 'linkedin';

interface SlidingAuthCardProps {
  initialMode?: 'signin' | 'signup';
}

export function SlidingAuthCard({ initialMode = 'signin' }: SlidingAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [isSignUp, setIsSignUp] = useState<boolean>(initialMode === 'signup');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Social Auth Loading State
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<SocialProvider | null>(null);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [isSignInLoading, setIsSignInLoading] = useState(false);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  // Switch between Sign In and Sign Up with seamless URL sync
  const toggleMode = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    const targetUrl = signUpMode ? '/signup' : '/login';
    const finalUrl = redirectPath !== '/dashboard' ? `${targetUrl}?redirect=${encodeURIComponent(redirectPath)}` : targetUrl;
    window.history.pushState(null, '', finalUrl);
  };

  // Handle Social Sign In with Better Auth
  const handleSocialSignIn = async (provider: SocialProvider) => {
    setSocialLoadingProvider(provider);
    try {
      const targetPath = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`;
      toast.loading(`Redirecting to ${provider.toUpperCase()} authentication...`, { id: 'social-auth' });

      const result = await signIn.social({
        provider,
        callbackURL: '/dashboard',
      });

      if (result && (result as any).error) {
        toast.error((result as any).error.message || `Failed to authenticate with ${provider}.`, { id: 'social-auth' });
      } else {
        toast.dismiss('social-auth');
      }
    } catch (err: any) {
      toast.error(
        err?.message ||
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth is not fully configured in Backend .env yet.`,
        { id: 'social-auth' }
      );
    } finally {
      setSocialLoadingProvider(null);
    }
  };

  // Handle Sign In Submit
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast.error('Please enter your email and password');
      return;
    }

    setIsSignInLoading(true);
    try {
      const result = await signIn.email({
        email: signInEmail,
        password: signInPassword,
      });

      if (result.error) {
        toast.error(result.error.message || 'Invalid email or password');
      } else {
        toast.success('Welcome back to InvoiceFlow!');
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSignInLoading(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSignUpLoading(true);
    try {
      const result = await signUp.email({
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
      });

      if (result.error) {
        toast.error(result.error.message || 'Signup failed');
      } else {
        toast.success('Account created successfully! Welcome to InvoiceFlow.');
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard';
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong during signup');
    } finally {
      setIsSignUpLoading(false);
    }
  };

  // Social Buttons Component
  const renderSocialButtons = () => {
    const providers: { provider: SocialProvider; title: string; icon: React.ReactNode }[] = [
      { provider: 'google', title: 'Google', icon: <GoogleIcon /> },
      { provider: 'github', title: 'GitHub', icon: <GithubIcon /> },
      { provider: 'facebook', title: 'Facebook', icon: <span className="font-bold text-xs text-[#1877F2]">f</span> },
      { provider: 'linkedin', title: 'LinkedIn', icon: <span className="font-bold text-xs text-[#0A66C2]">in</span> },
    ];

    return (
      <div className="flex items-center gap-3 my-4">
        {providers.map((soc) => (
          <button
            key={soc.provider}
            type="button"
            disabled={!!socialLoadingProvider}
            onClick={() => handleSocialSignIn(soc.provider)}
            className="w-10 h-10 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title={`Sign in with ${soc.title}`}
          >
            {socialLoadingProvider === soc.provider ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            ) : (
              soc.icon
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-6">
      {/* Top Floating Navigation */}
      <div className="flex items-center justify-between mb-4 max-w-5xl mx-auto px-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Explore Overview (Guest Preview)</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Better Auth & Stripe Ready</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP / TABLET SLIDING OVERLAY CONTAINER (md and above)
         ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block relative w-full min-h-[640px] rounded-[38px] overflow-hidden bg-white/95 dark:bg-[#0c0f1d]/90 border border-slate-200/90 dark:border-white/[0.08] shadow-[0_32px_96px_-20px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        {/* LEFT HALF: Sign In Form */}
        <motion.div
          animate={{
            opacity: isSignUp ? 0 : 1,
            x: isSignUp ? -40 : 0,
            scale: isSignUp ? 0.94 : 1,
            pointerEvents: isSignUp ? 'none' : 'auto',
          }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-0 w-1/2 h-full p-10 lg:p-12 flex flex-col justify-between z-10"
        >
          <div>
            {/* Header Brand */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="relative">
                <Image
                  src="/LOGO2.png"
                  alt="InvoiceFlow"
                  width={34}
                  height={34}
                  className="h-8 w-8 object-contain"
                  priority
                />
              </div>
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white font-sans">
                Invoice<span className="text-[#008779] dark:text-[#00A896]">Flow</span>
              </span>
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Sign In
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Access your real-time disbursements and invoice dashboard
              </p>
            </div>

            {/* Social Icons row */}
            {renderSocialButtons()}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                <span className="bg-white dark:bg-[#0c0f1d] px-2.5 text-slate-400">
                  or with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignInSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Email Address
                </label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="name@company.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                  className="bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 text-xs focus-visible:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => toast.info('Password reset instructions sent to your email.')}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showSignInPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                    required
                    className="bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 text-xs pr-10 focus-visible:ring-indigo-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showSignInPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isSignInLoading}
                className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-4"
              >
                Sign In to Workspace
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Bank-grade 256-bit encryption & Stripe Instant Payouts</span>
          </div>
        </motion.div>

        {/* RIGHT HALF: Sign Up Form */}
        <motion.div
          animate={{
            opacity: isSignUp ? 1 : 0,
            x: isSignUp ? 0 : 40,
            scale: isSignUp ? 1 : 0.94,
            pointerEvents: isSignUp ? 'auto' : 'none',
          }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-0 w-1/2 h-full p-10 lg:p-12 flex flex-col justify-between z-10"
        >
          <div>
            {/* Header Brand */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="relative">
                <Image
                  src="/LOGO2.png"
                  alt="InvoiceFlow"
                  width={34}
                  height={34}
                  className="h-8 w-8 object-contain"
                  priority
                />
              </div>
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white font-sans">
                Invoice<span className="text-[#008779] dark:text-[#00A896]">Flow</span>
              </span>
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                FREE TRIAL
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Start sending beautiful invoices and collecting payouts today
              </p>
            </div>

            {/* Social Icons row */}
            {renderSocialButtons()}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                <span className="bg-white dark:bg-[#0c0f1d] px-2.5 text-slate-400">
                  or register with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Full Name
                </label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Alex Morgan"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                  required
                  className="bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 rounded-2xl py-2 text-xs focus-visible:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Work Email
                </label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="alex@company.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                  className="bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 rounded-2xl py-2 text-xs focus-visible:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showSignUpPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                    required
                    className="bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 rounded-2xl py-2 text-xs pr-10 focus-visible:ring-indigo-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isSignUpLoading}
                className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-3"
              >
                Create Free Account
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            Free forever tier • No credit card required • Instant setup
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────────────
            3. LUXURY 3D HERO SLIDING OVERLAY PANEL (Curtain with 3D Mascot)
           ───────────────────────────────────────────────────────────── */}
        <motion.div
          animate={{
            x: isSignUp ? '0%' : '100%',
          }}
          transition={{
            type: 'spring',
            stiffness: 220,
            damping: 25,
          }}
          className="absolute top-0 left-0 w-1/2 h-full z-20 overflow-hidden bg-gradient-to-br from-[#4338ca] via-[#3730a3] to-[#581c87] text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 lg:p-10 flex flex-col justify-between items-center text-center select-none"
        >
          {/* Ambient Lighting Flares inside the curtain */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-indigo-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />

          {/* Top Pill Chip */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-indigo-100 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Fintech Invoicing Redefined</span>
            </span>
          </div>

          {/* Centerpiece: 3D Mascot with Levitating Motion & Dynamic Glow */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center">
            {/* Soft dynamic contact shadow beneath mascot */}
            <motion.div
              animate={{
                scale: [1, 0.88, 1],
                opacity: [0.35, 0.2, 0.35],
              }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute bottom-2 w-48 h-8 bg-black/50 rounded-[100%] blur-md pointer-events-none"
            />

            {/* Levitating 3D Mascot */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative cursor-pointer group"
            >
              <Image
                src="/auth-character-transparent.png"
                alt="InvoiceFlow 3D Mascot"
                width={270}
                height={270}
                className="w-52 h-52 lg:w-60 lg:h-60 object-contain filter drop-shadow-[0_22px_32px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-105"
                priority
              />

              {/* Floating Fintech Micro-Badge #1 (Top Right) */}
              <motion.div
                animate={{
                  y: [0, -6, 0],
                  x: [0, 3, 0],
                }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4,
                }}
                className="absolute -top-2 -right-8 lg:-right-10 bg-slate-900/80 backdrop-blur-xl border border-white/20 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 text-left pointer-events-none"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Instant Payout
                  </div>
                  <div className="text-xs font-black text-white">$14,250.00</div>
                </div>
              </motion.div>

              {/* Floating Fintech Micro-Badge #2 (Bottom Left) */}
              <motion.div
                animate={{
                  y: [0, 6, 0],
                  x: [0, -3, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.8,
                }}
                className="absolute -bottom-2 -left-8 lg:-left-10 bg-slate-900/80 backdrop-blur-xl border border-white/20 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-left pointer-events-none"
              >
                <div className="w-6 h-6 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-indigo-200 font-semibold">
                    Stripe Verified
                  </div>
                  <div className="text-[10px] font-bold text-white">PCI-DSS 256-bit</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Dynamic Content Text & Switcher CTA Button */}
          <div className="relative z-10 max-w-sm w-full">
            <AnimatePresence mode="wait">
              {!isSignUp ? (
                <motion.div
                  key="overlay-signin-mode"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3.5"
                >
                  <h3 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                    Start Invoicing in Seconds.
                  </h3>
                  <p className="text-xs text-indigo-100/90 font-medium leading-relaxed max-w-xs mx-auto">
                    Sign up now and join 12,000+ founders & creators managing automated client payouts.
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleMode(true)}
                      className="px-8 py-3 rounded-full bg-white text-indigo-950 font-black text-xs uppercase tracking-wider hover:bg-indigo-50 transition-all duration-200 shadow-xl shadow-black/25 hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="overlay-signup-mode"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3.5"
                >
                  <h3 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                    Welcome Back, Founder.
                  </h3>
                  <p className="text-xs text-indigo-100/90 font-medium leading-relaxed max-w-xs mx-auto">
                    Already registered? Sign into your workspace to track disbursements & Stripe balances.
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleMode(false)}
                      className="px-8 py-3 rounded-full bg-white text-indigo-950 font-black text-xs uppercase tracking-wider hover:bg-indigo-50 transition-all duration-200 shadow-xl shadow-black/25 hover:scale-105 active:scale-95 cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE RESPONSIVE STACKED CARD (Screens below md)
         ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden w-full max-w-md mx-auto rounded-3xl bg-white/95 dark:bg-[#0c0f1d]/95 border border-slate-200/90 dark:border-white/[0.08] shadow-2xl p-6 relative overflow-hidden backdrop-blur-2xl">
        {/* Ambient Top Flare */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Image
              src="/LOGO2.png"
              alt="InvoiceFlow"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="font-black text-base tracking-tight text-slate-900 dark:text-white font-sans">
              Invoice<span className="text-[#008779] dark:text-[#00A896]">Flow</span>
            </span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            Instant Payouts
          </span>
        </div>

        {/* 3D Mascot Hero Banner for Mobile */}
        <div className="relative py-2 flex flex-col items-center justify-center my-2">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <Image
              src="/auth-character-transparent.png"
              alt="Mascot"
              width={160}
              height={160}
              className="w-36 h-36 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
              priority
            />
            {/* Floating Mini-Chip */}
            <div className="absolute -bottom-1 -right-2 bg-slate-900/90 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5 text-[10px] font-black text-emerald-400">
              <Zap className="w-3 h-3 fill-emerald-400" />
              <span>$14,250 Paid</span>
            </div>
          </motion.div>
        </div>

        {/* Social Buttons Row on Mobile */}
        <div className="flex justify-center mb-4">
          {renderSocialButtons()}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-6 relative">
          <button
            type="button"
            onClick={() => toggleMode(false)}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-bold transition-all relative z-10 cursor-pointer',
              !isSignUp
                ? 'text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => toggleMode(true)}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-bold transition-all relative z-10 cursor-pointer',
              isSignUp
                ? 'text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            Sign Up
          </button>

          {/* Animated active pill background */}
          <motion.div
            layoutId="mobile-auth-tab"
            className="absolute top-1 bottom-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl"
            style={{
              left: isSignUp ? '50%' : '4px',
              right: isSignUp ? '4px' : '50%',
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        </div>

        {/* Mobile Forms */}
        <AnimatePresence mode="wait">
          {!isSignUp ? (
            <motion.div
              key="mobile-signin"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                <Input
                  id="mobile-signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                  className="bg-slate-50 dark:bg-slate-900/80 rounded-xl py-2.5 text-xs"
                />

                <Input
                  id="mobile-signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                  className="bg-slate-50 dark:bg-slate-900/80 rounded-xl py-2.5 text-xs"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => toast.info('Password reset instructions sent to your email.')}
                    className="text-[11px] font-semibold text-indigo-500 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  isLoading={isSignInLoading}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg cursor-pointer"
                >
                  Sign In
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="mobile-signup"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSignUpSubmit} className="space-y-3">
                <Input
                  id="mobile-signup-name"
                  type="text"
                  placeholder="Full Name"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                  required
                  className="bg-slate-50 dark:bg-slate-900/80 rounded-xl py-2 text-xs"
                />

                <Input
                  id="mobile-signup-email"
                  type="email"
                  placeholder="Email Address"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  required
                  className="bg-slate-50 dark:bg-slate-900/80 rounded-xl py-2 text-xs"
                />

                <Input
                  id="mobile-signup-password"
                  type="password"
                  placeholder="Create Password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                  className="bg-slate-50 dark:bg-slate-900/80 rounded-xl py-2 text-xs"
                />

                <Button
                  type="submit"
                  isLoading={isSignUpLoading}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg cursor-pointer mt-2"
                >
                  Create Account
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
