import { SettingsNav } from '../components/settings-nav';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <SettingsNav
          items={[
            {
              title: 'Profile',
              href: '/settings',
              icon: 'user',
            },
            {
              title: 'Billing',
              href: '/settings/billing',
              icon: 'credit-card',
            },
            {
              title: 'Privacy',
              href: '/settings/privacy',
              icon: 'shield',
            },
          ]}
        />
        <main>{children}</main>
      </div>
    </div>
  );
} 