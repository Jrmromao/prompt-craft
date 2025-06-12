'use client';
import { SignIn } from '@clerk/nextjs';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { dark} from '@clerk/themes';

export default function SignInPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div
      className={`relative flex min-h-screen items-center justify-center bg-white text-gray-900 transition-colors duration-300 dark:bg-black dark:text-white`}
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

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-6 py-12">
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
        <h1 className="mb-2 text-center text-3xl font-extrabold leading-tight md:text-4xl">
          Welcome
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            to PromptCraft
          </span>
        </h1>
        <p className="mb-8 text-center text-base font-normal text-gray-600 dark:text-gray-300">
          Sign in to your account to start creating amazing prompts
        </p>

        {/* Glassmorphism Card - now handled by Clerk's card style */}
        <SignIn
          key={theme}
          appearance={{
            baseTheme: theme === 'dark' ? dark : undefined,
            elements: {
              headerTitle: 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold',
              headerSubtitle: 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold',
              header: 'hidden',
               formButtonPrimary:
                'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20',
              footer: 'hidden',
    
            },
         
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/profile"
        />

        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a
              href="/sign-up"
              className="font-semibold text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400"
            >
              Sign up now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
