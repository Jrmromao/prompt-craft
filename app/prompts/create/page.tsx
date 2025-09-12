import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { CreatePromptClient } from './ClientPromptCreate';

export default async function CreatePromptPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return <CreatePromptClient />;
}
