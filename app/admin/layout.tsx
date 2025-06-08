import AdminSidebar from './components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="fixed inset-y-0 z-50 w-64">
        <AdminSidebar />
      </div>
      <div className="w-64 flex-shrink-0" /> {/* Spacer for fixed sidebar */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
