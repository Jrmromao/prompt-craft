'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, History, Sparkles, CreditCard, BarChart2, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { NavBar } from "@/components/layout/NavBar";

interface Prompt {
  id: string;
  input: string;
  model: string;
  creditsUsed: number;
  createdAt: string;
}

interface CreditHistory {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface UsageData {
  date: string;
  credits: number;
}

interface DashboardClientProps {
  user: {
    id: string;
    clerkId: string;
    name: string;
    email: string;
    imageUrl: string;
    credits: number;
    plan: {
      id: string;
      name: string;
      features: string[];
      price: number;
      createdAt: string;
      updatedAt: string;
      credits: number;
      creditCap: number;
      type: string;
      period: string;
      isActive: boolean;
    } | null;
    role: string;
    createdAt: string;
    updatedAt: string;
    creditCap: number;
    lastCreditReset: string;
    stripeCustomerId: string;
  };
  prompts: Prompt[];
  creditHistory: CreditHistory[];
  usageData: UsageData[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className="fixed top-6 right-6 z-50 bg-background/80 backdrop-blur border border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary transition-colors"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default function DashboardClient({ user, prompts, creditHistory, usageData }: DashboardClientProps) {
  // Table pagination state (for demo, not full implementation)
  const [promptPage] = useState(1);
  const [historyPage] = useState(1);

  return (
    <>
      <NavBar user={user} />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 relative">
        {/* Top Card: Account Overview */}
        <Card className="flex flex-col md:flex-row items-center justify-between p-6 gap-4 shadow-md">
          <div className="flex items-center gap-6 w-full">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <CreditCard className="w-6 h-6 text-primary" />
              {user.credits}
              <span className="text-base font-normal text-muted-foreground ml-2">credits available</span>
            </div>
            <div className="ml-8 text-muted-foreground text-base">
              <span className="block">Plan: <span className="font-medium text-foreground">{user.plan?.name || 'Free'}</span></span>
              <span className="block">Next reset: {formatDate(user.lastCreditReset)}</span>
            </div>
          </div>
          <Button className="ml-auto w-full md:w-auto transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary" asChild>
            <Link href="/prompts/create">Use Prompt</Link>
          </Button>
        </Card>

        {/* Prompt Actions Card */}
        <Card className="p-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg">
          <CardHeader className="p-0 mb-4 flex flex-row items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <CardTitle className="text-white">Prompt Actions</CardTitle>
          </CardHeader>
          <CardDescription className="mb-6 text-white/80">Manage your prompts and create new ones</CardDescription>
          <div className="flex flex-col md:flex-row gap-4">
            <Button className="w-full md:w-auto bg-white text-purple-700 font-semibold hover:bg-purple-100 focus-visible:ring-2 focus-visible:ring-white" asChild>
              <Link href="/prompts/create">
                <Plus className="w-4 h-4 mr-2" />
                Create New Prompt
              </Link>
            </Button>
            <Button variant="outline" className="w-full md:w-auto border-white text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white" asChild>
              <Link href="/prompts/history">
                <History className="w-4 h-4 mr-2" />
                View Prompt History
              </Link>
            </Button>
          </div>
        </Card>

        {/* Data Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Prompts Table */}
          <Card className="p-6">
            <CardTitle className="mb-4">Recent Prompts</CardTitle>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="py-2 px-3 text-left">Input</th>
                    <th className="py-2 px-3 text-left">Model</th>
                    <th className="py-2 px-3 text-left">Credits</th>
                    <th className="py-2 px-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {prompts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">No data found.</td>
                    </tr>
                  ) : (
                    prompts.map((prompt) => (
                      <tr key={prompt.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                        <td className="py-2 px-3 max-w-xs truncate">{prompt.input}</td>
                        <td className="py-2 px-3">{prompt.model}</td>
                        <td className="py-2 px-3">{prompt.creditsUsed}</td>
                        <td className="py-2 px-3">{formatDate(prompt.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination (placeholder) */}
            <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
              <span>Rows per page: 5</span>
              <span>Page {promptPage} of 1</span>
            </div>
          </Card>
          {/* Credit History Table */}
          <Card className="p-6">
            <CardTitle className="mb-4">Credit History</CardTitle>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="py-2 px-3 text-left">Type</th>
                    <th className="py-2 px-3 text-left">Amount</th>
                    <th className="py-2 px-3 text-left">Description</th>
                    <th className="py-2 px-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {creditHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">No data found.</td>
                    </tr>
                  ) : (
                    creditHistory.map((entry) => (
                      <tr key={entry.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                        <td className="py-2 px-3">
                          <Badge variant={entry.type === "ADD" ? "default" : "secondary"}>
                            {entry.type}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">{entry.amount}</td>
                        <td className="py-2 px-3 max-w-xs truncate">{entry.description}</td>
                        <td className="py-2 px-3">{formatDate(entry.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination (placeholder) */}
            <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
              <span>Rows per page: 5</span>
              <span>Page {historyPage} of 1</span>
            </div>
          </Card>
        </div>

        {/* Usage Statistics Chart */}
        <Card className="p-6">
          <CardTitle className="mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Usage Statistics
          </CardTitle>
          <div className="w-full h-64 flex items-center justify-center bg-muted rounded-lg">
            {/* Placeholder for chart - replace with your chart component */}
            <span className="text-muted-foreground">[Usage chart goes here]</span>
          </div>
        </Card>
      </div>
    </>
  );
} 