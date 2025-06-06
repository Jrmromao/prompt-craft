import { SupportNav } from '@/components/support/SupportNav';
import { SupportHeader } from '@/components/support/SupportHeader';

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b from-blue-50/60 to-white">
      <div className="w-full max-w-3xl px-4 py-8 sm:px-6 md:px-8">
        <SupportHeader />
        <SupportNav />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
