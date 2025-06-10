import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ClientPromptCreate from './ClientPromptCreate';

export default async function CreatePromptPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const navUser = {
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
    email: user.emailAddresses?.[0]?.emailAddress || '',
    imageUrl: user.imageUrl,
  };

  return <ClientPromptCreate user={navUser} />;
}
