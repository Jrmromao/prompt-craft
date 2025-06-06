import { currentUser } from '@clerk/nextjs/server';
import { PrivacyContent } from './PrivacyContent';

export default async function PrivacyPage() {
  const user = await currentUser();
  const navUser = user
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
      }
    : null;

  return <PrivacyContent user={navUser} />;
}
