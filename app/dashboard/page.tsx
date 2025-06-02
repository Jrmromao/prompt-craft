import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { CreditType, UserWithPlan } from "@/types/prisma";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { validateAuthentication } from '@/lib/actions/authValidation.action';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';

// Mock user data
const mockUser: UserWithPlan = {
  id: "mock-user-id",
  clerkId: "mock-clerk-id",
  email: "mockuser@example.com",
  credits: 100,
  plan: { id: "plan-free", name: "FREE", features: [], price: 0, stripePriceId: "", monthlyCredits: 100, createdAt: new Date(), updatedAt: new Date() },
  name: "Mock User",
  role: Role.FREE,
  planId: "plan-free",
  lastPromptAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrompts = [
  {
    id: "prompt-1",
    input: "Write a poem about the sea.",
    output: "The sea is vast and blue...",
    model: "gpt-4",
    creditsUsed: 2,
    createdAt: new Date(),
    userId: "mock-user-id",
    updatedAt: new Date(),
  },
  {
    id: "prompt-2",
    input: "Summarize the history of AI.",
    output: "AI began in the 1950s...",
    model: "gpt-4",
    creditsUsed: 3,
    createdAt: new Date(),
    userId: "mock-user-id",
    updatedAt: new Date(),
  },
];

const mockCreditHistory = [
  {
    id: "credit-1",
    type: "BONUS" as CreditType,
    amount: 100,
    description: "Welcome bonus",
    createdAt: new Date(),
    userId: "mock-user-id",
  },
  {
    id: "credit-2",
    type: "USAGE" as CreditType,
    amount: -2,
    description: "Prompt usage",
    createdAt: new Date(),
    userId: "mock-user-id",
  },
];

export default async function DashboardPage() {
  const auth = await validateAuthentication();
  if (!auth.success) {
    redirect('/sign-in?redirect_url=/dashboard');
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/prompts">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Prompts
              </Button>
            </Link>
            <SignOutButton>
              <Button variant="outline" className="ml-2">Sign Out</Button>
            </SignOutButton>
          </div>
        </div>
        <DashboardClient
          user={mockUser}
          prompts={mockPrompts}
          creditHistory={mockCreditHistory}
        />
      </div>
    </div>
  );
}