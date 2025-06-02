import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function UpgradeBanner() {
  return (
    <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <div>
            <h3 className="text-xl font-semibold">Upgrade Your Plan</h3>
            <p className="text-muted-foreground">
              Get more credits and access to premium features
            </p>
          </div>
        </div>
        <Button asChild size="lg">
          <Link href="/billing">View Plans</Link>
        </Button>
      </div>
    </Card>
  );
} 