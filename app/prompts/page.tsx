import { validateSubscription } from '@/lib/actions/subscriptionValidation.action';
import { validateAuthentication } from '@/lib/actions/authValidation.action';
import { redirect } from 'next/navigation';
import { PromptsClient } from '@/components/PromptsClient';
import { EmptyState } from '@/components/ui/empty-state';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mark page as dynamic since it uses authentication and subscription data
export const dynamic = 'force-dynamic';

export default async function PromptsPage() {
  const auth = await validateAuthentication();
  if (!auth.success) {
    redirect('/sign-in?redirect_url=/prompts');
  }

  const subscription = await validateSubscription();


  // If user can't create prompts, redirect to pricing
  if (!subscription.canCreate) {
    redirect(subscription.redirectTo || '/pricing');
  }

  // For paid tiers, show full prompts interface
  return <PromptsClient mode="full" />;
}
