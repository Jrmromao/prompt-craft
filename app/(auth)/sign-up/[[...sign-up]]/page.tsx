'use client';
import { SignUp } from '@clerk/nextjs';
import { Sparkles, Sun, Moon, CalendarIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { dark } from '@clerk/themes';
import { useSearchParams } from 'next/navigation';
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Image from 'next/image';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format, parseISO, isValid } from 'date-fns';

export default function SignUpPage() {
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/pricing';
  const { signUp } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function getAge(dateString: string): number {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const age = getAge(dateOfBirth);
    if (age < 16) {
      setError("You must be at least 16 years old to sign up.");
      return;
    }
    setLoading(true);
    try {
      if (!signUp) {
        setError("Sign up is not available. Please try again later.");
        setLoading(false);
        return;
      }
      await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: { dateOfBirth },
      });
      setSuccess(true);
      // Optionally, redirect or continue sign-up flow
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'errors' in err && Array.isArray((err as any).errors)) {
        setError((err as any).errors?.[0]?.message || "Sign up failed.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Sign up failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: "oauth_google" | "oauth_github") => {
    if (!signUp) return;
    signUp.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: "/sso-callback", // OAuth provider redirects here
      redirectUrlComplete: "/onboarding/collect-dob", // After Clerk completes, collect DOB
    });
  };

  return (
    <div
      className={
        'relative flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-purple-50 to-pink-50 dark:from-black dark:via-[#18122B] dark:to-black'
      }
    >
      {/* Light/Dark Mode Toggle */}
      <div className="fixed right-4 top-4 z-50">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-2 text-white shadow-md transition-transform hover:scale-110"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
        <div className="animate-bounce-slow absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-pink-500/5 blur-2xl" />
        <div className="animate-pulse-slow absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[800px] flex flex-col items-center px-4 py-12 rounded-2xl bg-white/60 dark:bg-[#18122B]/70 border border-purple-200 dark:border-purple-900 backdrop-blur-xl shadow-2xl shadow-purple-500/10" style={{ boxShadow: '0 8px 32px 0 rgba(80, 0, 120, 0.10)' }}>
        {/* Floating Gradient Icon */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          {/* Pill Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100/40 px-4 py-1 shadow-sm dark:border-purple-800 dark:bg-[#18122B]">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-200">
              AI-Powered Prompt Generation
            </span>
          </div>
        </div>
        {/* Heading */}
        <h1 className="mb-2 text-center text-4xl font-extrabold leading-tight md:text-5xl">
          Create your free account<br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            on PromptHiveCO
          </span>
        </h1>
        <p className="mb-8 text-center text-base font-normal text-gray-600 dark:text-gray-300 max-w-xl">
          Sign up to unlock AI-powered prompt generation, collaborate with a creative community, and access premium features.
        </p>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row w-full gap-8 items-stretch">
          {/* OAuth Column */}
          <div className="flex flex-col gap-3 w-full md:w-[360px] justify-center">
            <button
              type="button"
              onClick={() => handleOAuth("oauth_google")}
              className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 text-gray-900 py-2.5 px-4 rounded-lg font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              aria-label="Sign up with Google"
            >
              <Image src="/google.svg" alt="Google" width={24} height={24} className="h-5 w-5" />
              Sign up with Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("oauth_github")}
              className="flex items-center justify-center gap-3 w-full bg-black text-white py-2.5 px-4 rounded-lg font-medium shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              aria-label="Sign up with GitHub"
            >
              <Image src="/github.svg" alt="GitHub" width={24} height={24} className="h-5 w-5" />
              Sign up with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="hidden md:flex flex-col justify-center items-center px-2">
            <div className="h-24 w-px bg-purple-100 dark:bg-purple-900 mb-2" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-24 w-px bg-purple-100 dark:bg-purple-900 mt-2" />
          </div>
          <div className="flex md:hidden flex-row items-center gap-2 my-4">
            <div className="flex-1 h-px bg-purple-100 dark:bg-purple-900" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-purple-100 dark:bg-purple-900" />
          </div>

          {/* Email/Password/DOB Column */}
          <form onSubmit={handleSignUp} className="w-full md:w-[360px] flex flex-col gap-5">
            <label className="flex flex-col gap-1">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded border px-3 py-2 text-black dark:text-white dark:bg-[#18122B] focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </label>
            <label className="flex flex-col gap-1">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded border px-3 py-2 text-black dark:text-white dark:bg-[#18122B] focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </label>
            <label className="flex flex-col gap-1">
              Date of Birth
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full rounded border px-3 py-2 text-left text-black dark:text-white dark:bg-[#18122B] focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Select your date of birth"
                  >
                    {dateOfBirth && isValid(parseISO(dateOfBirth))
                      ? format(parseISO(dateOfBirth), 'PPP')
                      : <span className="text-gray-400">Select date</span>}
                    <CalendarIcon className="ml-2 h-5 w-5 text-purple-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" className="p-0 w-auto bg-white dark:bg-[#18122B] border border-gray-200 dark:border-gray-700">
                  <DayPicker
                    mode="single"
                    selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                    onSelect={date => {
                      setDateOfBirth(date ? date.toISOString().split('T')[0] : '');
                    }}
                    fromYear={new Date().getFullYear() - 100}
                    toYear={new Date().getFullYear()}
                    defaultMonth={new Date(new Date().setFullYear(new Date().getFullYear() - 16))}
                    captionLayout="dropdown"
                    showOutsideDays
                    required
                    disabled={date => date > new Date()}
                    modifiersStyles={{
                      selected: { backgroundColor: '#a855f7', color: 'white' },
                      today: { borderColor: '#a855f7' },
                    }}
                    styles={{
                      caption: { color: '#a855f7' },
                      day: { borderRadius: '0.5rem', fontWeight: 500 },
                    }}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">You must be at least 16 years old. No future dates allowed.</span>
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              By signing up, you confirm you are at least 16 years old and agree to our{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-purple-600 dark:text-purple-400">Privacy Policy</a>.
            </p>
            {error && <div className="text-red-500 text-sm" role="alert">{error}</div>}
            {success && <div className="text-green-500 text-sm" role="status">Sign up successful! Please check your email to verify your account.</div>}
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-pink-400"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>
        <div className="mt-6 text-center w-full">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a
              href="/sign-in"
              className="font-semibold text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
