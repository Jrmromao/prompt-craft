import { validateSubscription } from '@/lib/actions/subscriptionValidation.action';
import { validateAuthentication } from '@/lib/actions/authValidation.action';
import { redirect } from 'next/navigation';
import { PromptsClient } from '@/components/PromptsClient';
import { DashboardService } from '@/lib/services/dashboardService';

export default async function PromptsPage() {
  const auth = await validateAuthentication();
  if (!auth.success) {
    redirect("/sign-in?redirect_url=/prompts");
  }

  const subscription = await validateSubscription();
  const dashboardService = DashboardService.getInstance();
  const user = await dashboardService.getUserData(auth.user.id);

  // Free tier users can only create prompts, not view history
  if (user.role === 'FREE') {
    return <PromptsClient mode="create" />;
  }

  // If user can't create prompts, redirect to pricing
  if (!subscription.canCreate) {
    redirect(subscription.redirectTo || '/pricing');
  }

  // For paid tiers, show full prompts interface
  return <PromptsClient mode="full" />;
} 