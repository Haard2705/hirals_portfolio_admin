export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <main className="flex-1 bg-white p-6">
        {children}
      </main>
    </div>
  );
}
