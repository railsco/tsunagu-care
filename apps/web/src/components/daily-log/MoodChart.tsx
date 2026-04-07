'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { DailyLog } from '@tsunagu-care/shared';

interface MoodChartProps {
  logs: DailyLog[];
  title?: string;
}

// 色の定義
const CHART_COLORS = {
  mood: '#3b82f6',      // blue
  appetite: '#f97316',  // orange
  sleep: '#a855f7',     // purple
  activity: '#22c55e',  // green
};

export function MoodChart({ logs, title = '状態の推移' }: MoodChartProps) {
  // データを日付昇順に並び替え（過去30日間）
  const chartData = [...logs]
    .sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime())
    .map((log) => ({
      date: formatDate(log.log_date, 'M/d'),
      fullDate: formatDate(log.log_date, 'yyyy年M月d日'),
      気分: log.mood,
      食欲: log.appetite,
      睡眠: log.sleep_quality,
      活動: log.activity_level,
    }));

  if (chartData.length === 0) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📊 {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <TrendingUp className="h-12 w-12 mb-4" />
            <p>データがありません</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          📊 {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                padding: '12px',
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullDate;
                }
                return label;
              }}
              formatter={(value: number, name: string) => [
                `${value}/5`,
                name,
              ]}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="気分"
              stroke={CHART_COLORS.mood}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.mood, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, fill: CHART_COLORS.mood }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="食欲"
              stroke={CHART_COLORS.appetite}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.appetite, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, fill: CHART_COLORS.appetite }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="睡眠"
              stroke={CHART_COLORS.sleep}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.sleep, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, fill: CHART_COLORS.sleep }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="活動"
              stroke={CHART_COLORS.activity}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.activity, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, fill: CHART_COLORS.activity }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
