'use client';
import { SignIn } from '@clerk/nextjs';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { dark} from '@clerk/themes';
import { trackUserFlowError, trackUserFlowEvent } from '@/lib/error-tracking';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubHover, setGithubHover] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!isLoaded) {
      setError('Sign in is not available. Please try again later.');
      setLoading(false);
      return;
    }
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      if (result.status === 'complete') {
        router.push('/profile');
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: "oauth_google" | "oauth_github") => {
    if (!signIn) return;
    signIn.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/profile",
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
          <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 text-center">AI-Powered Prompt Generation</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 max-w-xs text-base">
            Unlock your creativity with advanced AI. Trusted by thousands of creators to generate, refine, and organize prompts effortlessly.
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
      {/* Sign-in Card */}
      <div className="w-full max-w-md mx-auto bg-white dark:bg-[#232136] rounded-xl shadow-lg p-8 flex flex-col gap-6 border border-gray-100 dark:border-[#393552] md:ml-0 md:mr-16">
        <h1 className="text-2xl font-bold text-center text-purple-700 dark:text-purple-300 mb-1">Sign In to PromptHiveCO</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-2">Sign in to your account to start creating amazing prompts.</p>
        <form onSubmit={handleSignIn} className="w-full flex flex-col gap-4">
          {/* Social Sign In Buttons */}
          <div className="flex flex-col gap-3 w-full mb-2">
            <button
              type="button"
              onClick={() => handleOAuth("oauth_google")}
              className="flex items-center justify-center gap-3 w-full bg-white dark:bg-white border border-gray-200 dark:border-[#393552] text-gray-900 dark:text-gray-900 py-2.5 px-4 rounded-md font-medium shadow-sm hover:bg-purple-50 dark:hover:bg-[#2a273f] focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              aria-label="Sign in with Google"
            >
              <img src="/google.svg" alt="Google" width={24} height={24} className="h-5 w-5" />
              Sign in with Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("oauth_github")}
              className={`flex items-center justify-center gap-3 w-full border py-2.5 px-4 rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition
                ${githubHover ? 'bg-purple-50 dark:bg-[#2a273f] border-purple-200 dark:border-[#393552]' : 'bg-white dark:bg-white text-gray-900 dark:text-gray-900 border-gray-200 dark:border-[#393552]'}`}
              aria-label="Sign in with GitHub"
              onMouseEnter={() => setGithubHover(true)}
              onMouseLeave={() => setGithubHover(false)}
            >
              <img src="/github.svg" alt="GitHub" width={24} height={24} className="h-5 w-5" />
              Sign in with GitHub
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
          {error && <div className="text-red-500 text-sm" role="alert">{error}</div>}
          <button
            type="submit"
            className="w-full rounded-md bg-gradient-to-r from-purple-600 to-pink-500 py-3 font-bold text-white shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <a href="/sign-up" className="font-semibold text-purple-600 hover:underline dark:text-purple-400">
            Sign up now
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
          <h2 className="text-lg font-bold text-purple-700 dark:text-purple-300 text-center">AI-Powered Prompt Generation</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 max-w-xs text-sm">
            Unlock your creativity with advanced AI. Trusted by thousands of creators.
          </p>
        </div>
      </div>
    </div>
  );
}
