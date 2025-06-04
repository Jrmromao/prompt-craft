// app/onboarding/page.tsx
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { prisma } from "@/lib/prisma";
import { Sparkles, Zap, Shield, Users } from "lucide-react";

export default async function OnboardingPage() {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
        redirect("/sign-in?redirect_url=/onboarding");
    }

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user) {
        redirect("/sign-in?redirect_url=/onboarding");
    }

    // If user is already onboarded, redirect to dashboard
    if (user.onboarded) {
        redirect("/dashboard");
    }

    const features = [
        {
            icon: <Zap className="w-6 h-6" />,
            title: "AI-Powered Prompts",
            description: "Create and optimize prompts with advanced AI assistance",
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Enterprise Security",
            description: "Bank-grade security for your prompts and data",
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Team Collaboration",
            description: "Work seamlessly with your team members",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            
            <div className="container relative mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 backdrop-blur-sm">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            Welcome to PromptCraft
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Let's create your personalized experience and unlock the full potential of AI-powered prompt engineering
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="relative group"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                <div className="relative bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 rounded-2xl blur opacity-30" />
                        <div className="relative bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border/50">
                            <OnboardingForm userId={user.id} />
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        <p>By continuing, you agree to our{" "}
                            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                            {" "}and{" "}
                            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}