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

export interface DailyAverage {
  date: string;
  fullDate: string;
  気分: number | null;
  食欲: number | null;
  睡眠: number | null;
  活動: number | null;
}

interface AverageScoreChartProps {
  data: DailyAverage[];
  title?: string;
}

const CHART_COLORS = {
  mood: '#3b82f6',
  appetite: '#f97316',
  sleep: '#a855f7',
  activity: '#22c55e',
};

// 担当利用者全体の日次平均スコア推移（MoodChartの集計版）
export function AverageScoreChart({ data, title = '全利用者の平均スコア推移' }: AverageScoreChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">📊 {title}</CardTitle>
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
        <CardTitle className="text-lg flex items-center gap-2">📊 {title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
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
              formatter={(value: number, name: string) => [`${value}/5`, name]}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
            {(
              [
                ['気分', CHART_COLORS.mood],
                ['食欲', CHART_COLORS.appetite],
                ['睡眠', CHART_COLORS.sleep],
                ['活動', CHART_COLORS.activity],
              ] as const
            ).map(([key, color]) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 6, fill: color }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
