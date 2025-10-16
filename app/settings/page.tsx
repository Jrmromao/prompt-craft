'use client';

import dynamic from 'next/dynamic';

const SettingsClient = dynamic(
  () => import('./SettingsClient').then((mod) => ({ default: mod.SettingsClient })),
  { ssr: false }
);

export default function SettingsPage() {
  return <SettingsClient />;
}
