import { EmptyState } from "@/components/ui/empty-state";
import { PlusCircle, History, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Prompt {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  creditsUsed: number;
}

interface CreditHistory {
  id: string;
  amount: number;
  description: string;
  createdAt: Date;
  type: "ADD" | "USE";
}

interface DashboardClientProps {
  user: {
    name: string;
    email: string;
    credits: number;
    creditCap: number;
    planType: string;
  };
  recentPrompts: Prompt[];
  creditHistory: CreditHistory[];
}

export function DashboardClient({ user, recentPrompts, creditHistory }: DashboardClientProps) {
  const creditUsage = (user.credits / user.creditCap) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your account
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Available Credits
          </h3>
          <div className="text-2xl font-bold">{user.credits}</div>
          <Progress value={creditUsage} className="mt-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {user.creditCap - user.credits} credits remaining
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Current Plan
          </h3>
          <div className="text-2xl font-bold capitalize">{user.planType}</div>
          <p className="text-sm text-muted-foreground mt-2">
            {user.planType === "FREE" ? "Upgrade for more features" : "Active subscription"}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Last Activity
          </h3>
          <div className="text-2xl font-bold">
            {recentPrompts[0]?.createdAt
              ? new Date(recentPrompts[0].createdAt).toLocaleDateString()
              : "No activity"}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {recentPrompts.length} prompts this month
          </p>
        </Card>
      </div>

      {/* Recent Prompts */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Recent Prompts</h2>
          <Button asChild>
            <Link href="/prompts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Prompt
            </Link>
          </Button>
        </div>

        {recentPrompts.length === 0 ? (
          <EmptyState
            icon={PlusCircle}
            title="No prompts yet"
            description="Create your first prompt to get started with PromptCraft."
            action={{
              label: "Create Prompt",
              onClick: () => window.location.href = "/prompts/new",
            }}
          />
        ) : (
          <div className="space-y-4">
            {recentPrompts.map((prompt) => (
              <Card key={prompt.id} className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{prompt.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {prompt.description}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      {new Date(prompt.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {prompt.creditsUsed} credits
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/prompts/${prompt.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Credit History */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Credit History</h2>

        {creditHistory.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No credit history"
            description="Your credit usage and additions will appear here."
          />
        ) : (
          <div className="space-y-4">
            {creditHistory.map((entry) => (
              <Card key={entry.id} className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{entry.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={entry.type === "ADD" ? "default" : "secondary"}
                  >
                    {entry.type === "ADD" ? "+" : "-"}{entry.amount} credits
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 