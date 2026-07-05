'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ClipboardList,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/uiStore';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  {
    name: '担当利用者一覧',
    href: '/dashboard',
    icon: ClipboardList,
    emoji: '📋',
  },
  {
    name: '統計',
    href: '/dashboard/stats',
    icon: BarChart3,
    emoji: '📊',
  },
  {
    name: '設定',
    href: '/dashboard/settings',
    icon: Settings,
    emoji: '⚙️',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebarCollapse, mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleNavClick = () => {
    // モバイルメニューを閉じる
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const SidebarContent = () => (
    <>
      {/* ロゴ */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-teal-800">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <span className="text-lg font-bold text-white">つなぐケア</span>
          </Link>
        )}
        {sidebarCollapsed && (
          <div className="flex items-center justify-center w-full">
            <span className="text-2xl">🤝</span>
          </div>
        )}
        {/* モバイル用閉じるボタン */}
        {mobileMenuOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-teal-800"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal-700 text-white'
                  : 'text-teal-100 hover:bg-teal-800 hover:text-white',
                sidebarCollapsed && 'justify-center px-2'
              )}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <span className="text-lg shrink-0">{item.emoji}</span>
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 下部エリア */}
      <div className="p-3 border-t border-teal-800 space-y-2">
        {/* ログアウトボタン */}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-teal-100 hover:bg-teal-800 hover:text-white',
            sidebarCollapsed && 'justify-center px-2'
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!sidebarCollapsed && <span className="ml-3">ログアウト</span>}
        </Button>

        {/* 折りたたみボタン（デスクトップのみ） */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full justify-center text-teal-300 hover:bg-teal-800 hover:text-white hidden lg:flex',
            sidebarCollapsed && 'px-2'
          )}
          onClick={toggleSidebarCollapse}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2">折りたたむ</span>
            </>
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* デスクトップサイドバー */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-teal-900 transition-all duration-300 hidden lg:flex lg:flex-col',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>

      {/* モバイルオーバーレイ */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* モバイルサイドバー */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 bg-teal-900 transition-transform duration-300 lg:hidden flex flex-col',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
