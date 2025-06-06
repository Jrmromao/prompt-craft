import { currentUser } from '@clerk/nextjs/server';
import ClientPromptCreate from './ClientPromptCreate';

export default async function CreatePromptPage() {
  const user = await currentUser();
  const navUser = user
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
      }
    : { name: 'Guest', email: '' };

  return <ClientPromptCreate user={navUser} />;
}
