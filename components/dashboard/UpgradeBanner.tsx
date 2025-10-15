import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function UpgradeBanner() {
  return (
    <Card className="bg-gradient-to-r from-blue-500/10 to-blue-500/10 p-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-4">
          <Sparkles className="h-8 w-8 text-blue-500" />
          <div>
            <h3 className="text-xl font-semibold">Upgrade Your Plan</h3>
            <p className="text-muted-foreground">Get more credits and access to premium features</p>
          </div>
        </div>
        <Button asChild size="lg">
          <Link href="/pricing">View Plans</Link>
        </Button>
      </div>
    </Card>
  );
}
