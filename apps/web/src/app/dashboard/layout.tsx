import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { getUser, getCareManager } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const careManager = await getCareManager();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar />

      {/* ヘッダー */}
      <Header userName={careManager?.name} />

      {/* メインコンテンツ */}
      <main className="pt-16 transition-all duration-300 lg:pl-64">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
