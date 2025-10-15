import AnalyticsLanding from '@/components/AnalyticsLanding';
import { currentUser } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';

export default async function Page() {
  try {
    const clerkUser = await currentUser();
    
    const user = clerkUser ? {
      id: clerkUser.id,
      name: clerkUser.firstName + ' ' + clerkUser.lastName,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      imageUrl: clerkUser.imageUrl
    } : null;

    return <AnalyticsLanding user={user} />;
  } catch (error) {
    Sentry.captureException(error);
    return <div>Sorry, something went wrong loading the page.</div>;
  }
}
