'use client';
import { SignUp } from '@clerk/nextjs';
import { Sparkles, Sun, Moon, CalendarIcon, ChevronDownIcon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { dark } from '@clerk/themes';
import { useSearchParams } from 'next/navigation';
import { useSignUp } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function SignUpPage() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const { signUp } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [githubHover, setGithubHover] = useState(false);

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
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-[#faf9fb] dark:bg-[#18122B]">
      {/* Value Proposition Section */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 h-full px-12">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg mb-2">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 text-center">Step 1: Create Your Account</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 max-w-xs text-base">
            Unlock AI-powered prompt generation, collaborate with a creative community, and access premium features free for 7 days. Trusted by thousands of creators.
          </p>
        </div>
      </div>
      {/* Light/Dark Mode Toggle */}
      <div className="fixed right-4 top-4 z-50">
        <button
          onClick={toggleTheme}
          className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-2 text-white shadow-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
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

      <div className="w-full max-w-md mx-auto bg-white dark:bg-[#232136] rounded-xl shadow-lg p-8 flex flex-col gap-6 border border-gray-100 dark:border-[#393552] md:ml-0 md:mr-16">
        <h1 className="text-2xl font-bold text-center text-purple-700 dark:text-purple-300 mb-1">Sign Up for PromptHiveCO</h1>
        <div className="w-full flex flex-col items-center mb-2">
          <span className="inline-block rounded-full bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-3 py-0.5 text-xs font-semibold border border-purple-100 dark:border-purple-800 mb-1">
            Step 1 of 2: Create Account
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-xs">
            You'll be redirected to payment after creating your account.
          </span>
        </div>
        <form onSubmit={handleSignUp} className="w-full flex flex-col gap-4">
          {/* Social Sign Up Buttons */}
          <div className="flex flex-col gap-3 w-full mb-2">
            <button
              type="button"
              onClick={() => handleOAuth("oauth_google")}
              className="flex items-center justify-center gap-3 w-full bg-white dark:bg-white border border-gray-200 dark:border-[#393552] text-gray-900 dark:text-gray-900 py-2.5 px-4 rounded-md font-medium shadow-sm hover:bg-purple-50 dark:hover:bg-[#2a273f] focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              aria-label="Sign up with Google"
            >
              <Image src="/google.svg" alt="Google" width={24} height={24} className="h-5 w-5" />
              Sign up with Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("oauth_github")}
              className={`flex items-center justify-center gap-3 w-full border py-2.5 px-4 rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition
                ${githubHover ? 'bg-purple-50 dark:bg-[#2a273f] border-purple-200 dark:border-[#393552]' : 'bg-white dark:bg-white text-gray-900 dark:text-gray-900 border-gray-200 dark:border-[#393552]'}`}
              aria-label="Sign up with GitHub"
              onMouseEnter={() => setGithubHover(true)}
              onMouseLeave={() => setGithubHover(false)}
            >
              <Image
                src="/github.svg"
                alt="GitHub"
                width={24}
                height={24}
                className="h-5 w-5"
              />
              Sign up with GitHub
            </button>
          </div>
          {/* Divider */}
          <div className="flex items-center my-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="mx-2 text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-black dark:text-white dark:bg-[#18122B] focus:outline-none focus:ring-2 focus:ring-purple-400"
              autoComplete="email"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-black dark:text-white dark:bg-[#18122B] focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </label>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="dob"
                  className="w-full justify-between font-normal"
                  aria-label="Select date of birth"
                >
                  {dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : "Select date"}
                  <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                  captionLayout="dropdown"
                  fromYear={new Date().getFullYear() - 100}
                  toYear={new Date().getFullYear() - 16}
                  onSelect={date => {
                    setDateOfBirth(date ? date.toISOString().split('T')[0] : '');
                  }}
                  disabled={date =>
                    !date ||
                    date > new Date() ||
                    date.getFullYear() > new Date().getFullYear() - 16 ||
                    date.getFullYear() < new Date().getFullYear() - 100
                  }
                  className="rounded-md border bg-background"
                />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-gray-400 dark:text-gray-500">You must be at least 16 years old. No future dates allowed.</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            By signing up, you confirm you are at least 16 years old and agree to our{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-purple-600 dark:text-purple-400">Privacy Policy</a>.
          </p>
          {error && <div className="text-red-500 text-sm" role="alert">{error}</div>}
          {success && <div className="text-green-500 text-sm" role="status">Sign up successful! Please check your email to verify your account.</div>}
          <button
            type="submit"
            className="w-full rounded-md bg-gradient-to-r from-purple-600 to-pink-500 py-3 font-bold text-white shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
            disabled={loading}
            aria-busy={loading}
          >
            Sign Up
          </button>
        </form>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <a href="/sign-in" className="font-semibold text-purple-600 hover:underline dark:text-purple-400">
            Sign in
          </a>
        </div>
        <div className="text-center mt-4">
          <a href="/" className="inline-block w-full">
            <button type="button" className="w-full rounded-md border border-gray-200 dark:border-gray-700 py-2 font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#232136] hover:bg-purple-50 dark:hover:bg-[#2a273f] transition">
              Go Home
            </button>
          </a>
        </div>
      </div>
      {/* Mobile Value Proposition (above card) */}
      <div className="flex md:hidden flex-col items-center justify-center w-full px-6 mt-8 mb-4">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg mb-1">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-purple-700 dark:text-purple-300 text-center">Step 1: Create Your Account</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 max-w-xs text-sm">
            Unlock AI-powered prompt generation, collaborate with a creative community, and access premium features free for 7 days. Trusted by thousands of creators.
          </p>
        </div>
      </div>
    </div>
  );
}
