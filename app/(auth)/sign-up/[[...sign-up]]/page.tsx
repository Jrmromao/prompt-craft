import { SignUp } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white relative">
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
                    <div className="inline-flex items-center gap-2 bg-[#18122B] border border-purple-800 rounded-full px-4 py-1 mb-6 shadow-sm">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-200 font-medium">AI-Powered Prompt Generation</span>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-center leading-tight mb-2">
                    Create your account<br />
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">PromptCraft</span>
                </h1>
                <p className="text-gray-300 text-center mb-8 text-base font-normal">
                    Sign up and start creating amazing prompts
                </p>

                {/* Glassmorphism Card */}
                <div className="w-full bg-[#18122B]/80 border border-[#2A1A4D] rounded-2xl shadow-xl backdrop-blur-md p-6 mb-6">
                    <SignUp
                        appearance={{
                            elements: {
                                formButtonPrimary:
                                    "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20",
                                card: "bg-transparent shadow-none border-0 p-0",
                                headerTitle: "hidden",
                                headerSubtitle: "hidden",
                                header: "hidden",
                                formFieldLabel: "text-gray-300",
                                formFieldInput: "border-gray-700 bg-[#18122B] text-white focus:border-purple-500 focus:ring-purple-500/20",
                                footerActionLink: "text-purple-400 hover:text-purple-300 font-semibold",
                                identityPreview: "bg-gray-800/50 border-gray-700",
                                identityPreviewText: "text-gray-300",
                                identityPreviewEditButton: "text-purple-400 hover:text-purple-300",
                                formFieldAction: "text-purple-400 hover:text-purple-300",
                                formFieldErrorText: "text-red-400",
                                formFieldSuccessText: "text-green-400",
                                footer: "hidden",
                                alertText: "text-gray-300/80",
                                socialButtonsBlockButton: "border-gray-700 hover:bg-gray-800/50",
                                socialButtonsBlockButtonText: "text-gray-300",
                                otpCodeFieldInput: "border-gray-700 bg-[#18122B] text-white",
                            },
                            variables: {
                                borderRadius: '16px',
                                fontFamily: 'inherit',
                            }
                        }}
                        routing="path"
                        path="/sign-up"
                        signInUrl="/sign-in"
                        redirectUrl="/dashboard"
                    />
                </div>

                <div className="mt-2 text-center">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{' '}
                        <a href="/sign-in" className="text-purple-400 hover:text-pink-400 font-semibold">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}