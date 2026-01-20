'use client';

import { cn } from '@/lib/utils';
import { HistoricalData } from '@/types/weather';
import { TemperatureUnit } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import { Toggle } from '@/components/ui/toggle';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';

// Dynamic import for Recharts to reduce initial bundle size
const AreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false }
);
const Area = dynamic(
  () => import('recharts').then((mod) => mod.Area),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
);

interface HistoricalChartProps {
  data: HistoricalData[];
  unit: TemperatureUnit;
  className?: string;
}

type ChartType = 'temperature' | 'precipitation';

export function HistoricalChart({ data, unit, className }: HistoricalChartProps) {
  const [chartType, setChartType] = useState<ChartType>('temperature');

  const chartData = data.map((d) => ({
    date: format(new Date(d.date), 'MMM d'),
    fullDate: d.date,
    max: Math.round(d.temperatureMax),
    min: Math.round(d.temperatureMin),
    mean: Math.round(d.temperatureMean),
    precipitation: d.precipitationSum,
  }));

  const unitSymbol = unit === 'celsius' ? '°C' : '°F';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Last 30 Days</CardTitle>
        <Toggle
          options={[
            { value: 'temperature', label: 'Temperature' },
            { value: 'precipitation', label: 'Rain' },
          ]}
          value={chartType}
          onChange={setChartType}
          size="sm"
        />
      </CardHeader>

      <div className="h-64 md:h-80 mt-4">
        {chartType === 'temperature' ? (
          <TemperatureChart data={chartData} unitSymbol={unitSymbol} />
        ) : (
          <PrecipitationChart data={chartData} />
        )}
      </div>

      {/* Summary stats */}
      <div className={cn(
        'grid grid-cols-3 gap-4 mt-6 pt-4 border-t',
        'border-slate-200 dark:border-slate-700'
      )}>
        {chartType === 'temperature' ? (
          <>
            <StatItem
              label="Avg High"
              value={`${Math.round(data.reduce((acc, d) => acc + d.temperatureMax, 0) / data.length)}${unitSymbol}`}
            />
            <StatItem
              label="Avg Low"
              value={`${Math.round(data.reduce((acc, d) => acc + d.temperatureMin, 0) / data.length)}${unitSymbol}`}
            />
            <StatItem
              label="Range"
              value={`${Math.round(Math.max(...data.map((d) => d.temperatureMax)) - Math.min(...data.map((d) => d.temperatureMin)))}${unitSymbol}`}
            />
          </>
        ) : (
          <>
            <StatItem
              label="Total Rain"
              value={`${data.reduce((acc, d) => acc + d.precipitationSum, 0).toFixed(1)} mm`}
            />
            <StatItem
              label="Rainy Days"
              value={`${data.filter((d) => d.precipitationSum > 0).length} days`}
            />
            <StatItem
              label="Max Daily"
              value={`${Math.max(...data.map((d) => d.precipitationSum)).toFixed(1)} mm`}
            />
          </>
        )}
      </div>
    </Card>
  );
}

function TemperatureChart({
  data,
  unitSymbol,
}: {
  data: Array<{ date: string; max: number; min: number; mean: number }>;
  unitSymbol: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          className="fill-slate-500 dark:fill-slate-400 text-xs"
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          className="fill-slate-500 dark:fill-slate-400 text-xs"
          tickFormatter={(value) => `${value}°`}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
            padding: '12px',
          }}
          formatter={(value, name) => [
            `${value}${unitSymbol}`,
            name === 'max' ? 'High' : name === 'min' ? 'Low' : 'Average',
          ]}
        />
        <Area
          type="monotone"
          dataKey="max"
          stroke="#f97316"
          fillOpacity={1}
          fill="url(#colorMax)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="min"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorMin)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function PrecipitationChart({
  data,
}: {
  data: Array<{ date: string; precipitation: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          className="fill-slate-500 dark:fill-slate-400 text-xs"
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          className="fill-slate-500 dark:fill-slate-400 text-xs"
          tickFormatter={(value) => `${value}mm`}
          width={50}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
            padding: '12px',
          }}
          formatter={(value) => [`${Number(value).toFixed(1)} mm`, 'Precipitation']}
        />
        <Bar
          dataKey="precipitation"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          maxBarSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
