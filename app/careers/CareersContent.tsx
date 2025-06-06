import { currentUser } from '@clerk/nextjs/server';
import { NavBar } from '@/components/layout/NavBar';
import { AuthOptionsBar } from '@/components/layout/AuthOptionsBar';
import Link from 'next/link';

const mockRoles = [
  {
    title: 'Frontend Engineer',
    location: 'Remote / Lisbon, Portugal',
    type: 'Full-time',
    description: 'Build beautiful, performant UIs for the next generation of AI tools.',
  },
  {
    title: 'Backend Engineer',
    location: 'Remote / Lisbon, Portugal',
    type: 'Full-time',
    description: 'Design and scale robust APIs and infrastructure for millions of users.',
  },
  {
    title: 'Product Designer',
    location: 'Remote / Europe',
    type: 'Contract / Freelance',
    description: 'Craft intuitive, delightful user experiences for prompt creators and teams.',
  },
  {
    title: 'Community Manager',
    location: 'Remote',
    type: 'Part-time',
    description: 'Grow and support our global community of AI prompt engineers.',
  },
];

export default async function CareersContent() {
  const user = await currentUser();
  const navUser = user
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
      }
    : null;

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      {navUser ? <NavBar user={navUser} /> : <AuthOptionsBar />}
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold">Careers</h1>
        <div className="grid gap-6">
          {mockRoles.map((role, index) => (
            <div key={index} className="rounded-lg border p-6 transition-shadow hover:shadow-lg">
              <h2 className="mb-2 text-2xl font-semibold">{role.title}</h2>
              <p className="mb-2 text-gray-600 dark:text-gray-400">
                {role.location} • {role.type}
              </p>
              <p className="text-gray-700 dark:text-gray-300">{role.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
