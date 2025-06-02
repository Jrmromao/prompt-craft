'use client'
import { SignIn } from "@clerk/nextjs";
import { Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function SignInPage() {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className={`min-h-screen flex items-center justify-center relative transition-colors duration-300 bg-white text-gray-900 dark:bg-black dark:text-white`}>
            {/* Light/Dark Mode Toggle */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={toggleTheme}
                    className="rounded-full p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:scale-110 transition-transform"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-2xl animate-bounce-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            <div className="w-full max-w-md mx-auto px-6 py-12 relative z-10 flex flex-col items-center">
                {/* Floating Gradient Icon */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    {/* Pill Badge */}
                    <div className="inline-flex items-center gap-2 bg-purple-100/40 dark:bg-[#18122B] border border-purple-200 dark:border-purple-800 rounded-full px-4 py-1 mb-6 shadow-sm">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-700 dark:text-purple-200 font-medium">AI-Powered Prompt Generation</span>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-center leading-tight mb-2">
                    Welcome<br />
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">to PromptCraft</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-8 text-base font-normal">
                    Sign in to your account to start creating amazing prompts
                </p>

                {/* Glassmorphism Card - now handled by Clerk's card style */}
                <SignIn
                    appearance={{
                        elements: {
                            card: "w-full bg-gray-100/80 dark:bg-[#18122B]/80 border border-purple-200 dark:border-[#2A1A4D] rounded-2xl shadow-xl backdrop-blur-md p-6 mb-6",
                            formButtonPrimary:
                                "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20",
                            headerTitle: "hidden",
                            headerSubtitle: "hidden",
                            header: "hidden",
                            formFieldLabel: "text-gray-700 dark:text-gray-300",
                            formFieldInput: "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18122B] text-gray-900 dark:text-white focus:border-purple-500 focus:ring-purple-500/20",
                            footerActionLink: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold",
                            identityPreview: "bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700",
                            identityPreviewText: "text-gray-700 dark:text-gray-300",
                            identityPreviewEditButton: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300",
                            formFieldAction: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300",
                            formFieldErrorText: "text-red-500 dark:text-red-400",
                            formFieldSuccessText: "text-green-500 dark:text-green-400",
                            footer: "hidden",
                            alertText: "text-gray-700/80 dark:text-gray-300/80",
                            socialButtonsBlockButton: "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50",
                            socialButtonsBlockButtonText: "text-gray-700 dark:text-gray-300",
                            otpCodeFieldInput: "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#18122B] text-gray-900 dark:text-white",
                        },
                        variables: {
                            borderRadius: '16px',
                            fontFamily: 'inherit',
                        }
                    }}
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    redirectUrl="/dashboard"
                />

                <div className="mt-2 text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Don't have an account?{' '}
                        <a href="/sign-up" className="text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 font-semibold">
                            Sign up now
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}