'use client';

import { usePathname } from 'next/navigation';
import { Menu, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

interface HeaderProps {
  userName?: string;
}

// パスからパンくずリストを生成
function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];

  const pathLabels: Record<string, string> = {
    dashboard: 'ダッシュボード',
    receivers: '利用者',
    'daily-logs': '日記一覧',
    feedbacks: 'フィードバック',
    family: 'ご家族',
    stats: '統計',
    settings: '設定',
  };

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;

    // UUIDっぽいセグメントはスキップ（利用者詳細ページのID）
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
      breadcrumbs.push({ label: '利用者詳細', href: currentPath });
      continue;
    }

    const label = pathLabels[segment];
    if (label) {
      breadcrumbs.push({ label, href: currentPath });
    }
  }

  return breadcrumbs;
}

// 現在のページタイトルを取得
function getPageTitle(pathname: string): string {
  const breadcrumbs = getBreadcrumbs(pathname);
  if (breadcrumbs.length === 0) return 'ダッシュボード';
  return breadcrumbs[breadcrumbs.length - 1].label;
}

export function Header({ userName }: HeaderProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, setMobileMenuOpen } = useUIStore();

  const breadcrumbs = getBreadcrumbs(pathname);
  const pageTitle = getPageTitle(pathname);

  // ユーザー名からイニシャルを生成
  const initials = userName
    ? userName
        .split('')
        .filter((char) => /[\u4e00-\u9faf]/.test(char)) // 漢字のみ抽出
        .slice(0, 2)
        .join('') || userName.slice(0, 2)
    : 'CM';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 transition-all duration-300',
        sidebarCollapsed ? 'lg:left-16' : 'lg:left-64',
        'left-0' // モバイルでは左端から
      )}
    >
      {/* 左側: ハンバーガーメニュー + パンくずリスト */}
      <div className="flex items-center gap-4">
        {/* モバイルメニューボタン */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* パンくずリスト */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-gray-900">{crumb.label}</span>
              ) : (
                <span className="text-gray-500">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>

        {/* モバイル用ページタイトル */}
        <h1 className="md:hidden font-medium text-gray-900">{pageTitle}</h1>
      </div>

      {/* 右側: ユーザー情報 */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-900">
            {userName || 'ケアマネージャー'}
          </p>
          <p className="text-xs text-gray-500">ケアマネージャー</p>
        </div>
        <Avatar className="h-9 w-9 border-2 border-teal-100">
          <AvatarFallback className="bg-teal-600 text-white text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
