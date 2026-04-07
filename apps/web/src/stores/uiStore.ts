import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // サイドバー
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;

  // モバイルメニュー
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // 日記表示期間
  dailyLogDays: number;
  setDailyLogDays: (days: number) => void;

  // グラフ表示期間
  chartDays: number;
  setChartDays: (days: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // サイドバー
      sidebarOpen: true,
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // モバイルメニュー
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      // 日記表示期間（デフォルト14日）
      dailyLogDays: 14,
      setDailyLogDays: (days) => set({ dailyLogDays: days }),

      // グラフ表示期間（デフォルト30日）
      chartDays: 30,
      setChartDays: (days) => set({ chartDays: days }),
    }),
    {
      name: 'tsunagu-care-ui',
      skipHydration: true,
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        dailyLogDays: state.dailyLogDays,
        chartDays: state.chartDays,
      }),
    }
  )
);
