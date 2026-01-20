'use client';

import { cn } from '@/lib/utils';
import { formatTemperatureValue, convertTemperature, convertPrecipitation } from '@/lib/utils';
import { HistoricalData, getWeatherCondition } from '@/types/weather';
import { Settings } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import { Toggle } from '@/components/ui/toggle';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Droplets,
  Thermometer,
  Sun,
  CloudRain,
  BarChart3,
} from 'lucide-react';

// Dynamic import for Recharts
const AreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const ComposedChart = dynamic(() => import('recharts').then((mod) => mod.ComposedChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false });

interface HistoricalChartProps {
  data: HistoricalData[];
  settings: Settings;
  className?: string;
}

type ChartType = 'temperature' | 'precipitation' | 'combined';

export function HistoricalChart({ data, settings, className }: HistoricalChartProps) {
  const [chartType, setChartType] = useState<ChartType>('temperature');

  const { temperatureUnit, precipitationUnit } = settings;
  const tempSymbol = temperatureUnit === 'celsius' ? '°C' : '°F';
  const precipSymbol = precipitationUnit === 'mm' ? 'mm' : 'in';

  // Process chart data
  const chartData = useMemo(() => data.map((d) => ({
    date: format(new Date(d.date), 'MMM d'),
    shortDate: format(new Date(d.date), 'd'),
    fullDate: d.date,
    max: formatTemperatureValue(d.temperatureMax, temperatureUnit),
    min: formatTemperatureValue(d.temperatureMin, temperatureUnit),
    mean: formatTemperatureValue(d.temperatureMean, temperatureUnit),
    precipitation: convertPrecipitation(d.precipitationSum, precipitationUnit),
    weatherCode: d.weatherCode,
  })), [data, temperatureUnit, precipitationUnit]);

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const temps = data.map(d => ({
      max: convertTemperature(d.temperatureMax, temperatureUnit),
      min: convertTemperature(d.temperatureMin, temperatureUnit),
      mean: convertTemperature(d.temperatureMean, temperatureUnit),
    }));

    const precips = data.map(d => convertPrecipitation(d.precipitationSum, precipitationUnit));

    // Temperature stats
    const avgHigh = Math.round(temps.reduce((acc, t) => acc + t.max, 0) / temps.length);
    const avgLow = Math.round(temps.reduce((acc, t) => acc + t.min, 0) / temps.length);
    const avgMean = Math.round(temps.reduce((acc, t) => acc + t.mean, 0) / temps.length);
    const maxTemp = Math.round(Math.max(...temps.map(t => t.max)));
    const minTemp = Math.round(Math.min(...temps.map(t => t.min)));
    const tempRange = maxTemp - minTemp;

    // Temperature trend (compare last 7 days avg to first 7 days avg)
    const first7Avg = temps.slice(0, 7).reduce((acc, t) => acc + t.mean, 0) / 7;
    const last7Avg = temps.slice(-7).reduce((acc, t) => acc + t.mean, 0) / 7;
    const tempTrend = last7Avg - first7Avg;

    // Precipitation stats
    const totalPrecip = precips.reduce((acc, p) => acc + p, 0);
    const rainyDays = data.filter(d => d.precipitationSum > 0).length;
    const maxDailyPrecip = Math.max(...precips);
    const avgDailyPrecip = totalPrecip / data.length;

    // Weather patterns
    const weatherCounts = data.reduce((acc, d) => {
      const condition = getWeatherCondition(d.weatherCode, true);
      acc[condition.label] = (acc[condition.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonWeather = Object.entries(weatherCounts)
      .sort(([, a], [, b]) => b - a)[0];

    // Sunny vs cloudy/rainy days
    const sunnyDays = data.filter(d => [0, 1, 2].includes(d.weatherCode)).length;
    const cloudyDays = data.filter(d => [3, 45, 48].includes(d.weatherCode)).length;

    return {
      avgHigh,
      avgLow,
      avgMean,
      maxTemp,
      minTemp,
      tempRange,
      tempTrend,
      totalPrecip,
      rainyDays,
      maxDailyPrecip,
      avgDailyPrecip,
      mostCommonWeather,
      sunnyDays,
      cloudyDays,
      dryDays: data.length - rainyDays,
    };
  }, [data, temperatureUnit, precipitationUnit]);

  // Weekly breakdown
  const weeklyData = useMemo(() => {
    const weeks: { week: string; avgHigh: number; avgLow: number; totalPrecip: number; days: number }[] = [];
    
    for (let i = 0; i < data.length; i += 7) {
      const weekData = data.slice(i, Math.min(i + 7, data.length));
      if (weekData.length === 0) continue;
      
      const startDate = format(new Date(weekData[0].date), 'MMM d');
      const endDate = format(new Date(weekData[weekData.length - 1].date), 'MMM d');
      
      weeks.push({
        week: `${startDate} - ${endDate}`,
        avgHigh: Math.round(weekData.reduce((acc, d) => acc + convertTemperature(d.temperatureMax, temperatureUnit), 0) / weekData.length),
        avgLow: Math.round(weekData.reduce((acc, d) => acc + convertTemperature(d.temperatureMin, temperatureUnit), 0) / weekData.length),
        totalPrecip: weekData.reduce((acc, d) => acc + convertPrecipitation(d.precipitationSum, precipitationUnit), 0),
        days: weekData.length,
      });
    }
    
    return weeks;
  }, [data, temperatureUnit, precipitationUnit]);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <CardTitle>Last 30 Days</CardTitle>
        </div>
        <Toggle
          options={[
            { value: 'temperature', label: '🌡️ Temp' },
            { value: 'precipitation', label: '🌧️ Rain' },
            { value: 'combined', label: '📊 Both' },
          ]}
          value={chartType}
          onChange={setChartType}
          size="sm"
        />
      </CardHeader>

      {/* Key Insights Banner */}
      <div className="px-4 pb-4">
        <div className={cn(
          'flex items-center gap-4 p-3 rounded-xl overflow-x-auto',
          'bg-linear-to-r from-slate-50 to-slate-100/50',
          'dark:from-slate-800/50 dark:to-slate-700/30',
          '[&::-webkit-scrollbar]:hidden'
        )}>
          <InsightBadge
            icon={stats.tempTrend > 2 ? <TrendingUp className="h-4 w-4" /> : 
                  stats.tempTrend < -2 ? <TrendingDown className="h-4 w-4" /> : 
                  <Minus className="h-4 w-4" />}
            label="Trend"
            value={stats.tempTrend > 0 ? `+${stats.tempTrend.toFixed(1)}°` : `${stats.tempTrend.toFixed(1)}°`}
            color={stats.tempTrend > 2 ? 'text-orange-500' : stats.tempTrend < -2 ? 'text-blue-500' : 'text-slate-500'}
          />
          <InsightBadge
            icon={<Sun className="h-4 w-4" />}
            label="Sunny"
            value={`${stats.sunnyDays} days`}
            color="text-amber-500"
          />
          <InsightBadge
            icon={<CloudRain className="h-4 w-4" />}
            label="Rainy"
            value={`${stats.rainyDays} days`}
            color="text-blue-500"
          />
          <InsightBadge
            icon={<Thermometer className="h-4 w-4" />}
            label="Range"
            value={`${stats.tempRange}${tempSymbol}`}
            color="text-violet-500"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 md:h-72 px-2">
        {chartType === 'temperature' && (
          <TemperatureChart data={chartData} tempSymbol={tempSymbol} />
        )}
        {chartType === 'precipitation' && (
          <PrecipitationChart data={chartData} precipSymbol={precipSymbol} />
        )}
        {chartType === 'combined' && (
          <CombinedChart data={chartData} tempSymbol={tempSymbol} precipSymbol={precipSymbol} />
        )}
      </div>

      {/* Statistics Grid */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700/50">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5" />
          Statistics
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
            label="Highest"
            value={`${stats.maxTemp}${tempSymbol}`}
            subtext="Max temperature"
          />
          <StatCard
            icon={<TrendingDown className="h-4 w-4 text-blue-500" />}
            label="Lowest"
            value={`${stats.minTemp}${tempSymbol}`}
            subtext="Min temperature"
          />
          <StatCard
            icon={<Droplets className="h-4 w-4 text-cyan-500" />}
            label="Total Rain"
            value={`${stats.totalPrecip.toFixed(precipitationUnit === 'inch' ? 2 : 1)}${precipSymbol}`}
            subtext={`${stats.rainyDays} rainy days`}
          />
          <StatCard
            icon={<Sun className="h-4 w-4 text-amber-500" />}
            label="Most Common"
            value={stats.mostCommonWeather?.[0] || 'N/A'}
            subtext={`${stats.mostCommonWeather?.[1] || 0} days`}
          />
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700/50">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Weekly Breakdown
        </h4>
        
        <div className="space-y-2">
          {weeklyData.map((week, index) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl',
                'bg-slate-50/50 dark:bg-slate-800/30',
                'hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-colors'
              )}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {week.week}
                </p>
                <p className="text-xs text-slate-400">Week {index + 1}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <span className="text-orange-500 font-semibold">{week.avgHigh}°</span>
                  <span className="text-slate-400 mx-1">/</span>
                  <span className="text-blue-500 font-semibold">{week.avgLow}°</span>
                </div>
                
                <div className="flex items-center gap-1 text-cyan-500 min-w-[60px] justify-end">
                  <Droplets className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {week.totalPrecip.toFixed(precipitationUnit === 'inch' ? 2 : 1)}{precipSymbol}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Temperature Averages */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700/50">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Temperature Averages
        </h4>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Low</span>
              <span>High</span>
            </div>
            <div className="relative h-3 rounded-full bg-linear-to-r from-blue-400 via-emerald-400 to-orange-400">
              {/* Average low marker */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800 shadow"
                style={{ left: `${((stats.avgLow - stats.minTemp) / stats.tempRange) * 100}%` }}
                title={`Avg Low: ${stats.avgLow}${tempSymbol}`}
              />
              {/* Average high marker */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-500 border-2 border-white dark:border-slate-800 shadow"
                style={{ left: `${((stats.avgHigh - stats.minTemp) / stats.tempRange) * 100}%` }}
                title={`Avg High: ${stats.avgHigh}${tempSymbol}`}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-blue-500 font-medium">{stats.minTemp}°</span>
              <span className="text-slate-400">Avg: {stats.avgMean}°</span>
              <span className="text-orange-500 font-medium">{stats.maxTemp}°</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function InsightBadge({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-slate-900/30 shrink-0">
      <span className={color}>{icon}</span>
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={cn('text-sm font-semibold', color)}>{value}</p>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subtext 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subtext: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-3 rounded-xl',
        'bg-slate-50/50 dark:bg-slate-800/30',
        'border border-slate-100 dark:border-slate-700/30'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-[10px] text-slate-400">{subtext}</p>
    </motion.div>
  );
}

function TemperatureChart({
  data,
  tempSymbol,
}: {
  data: Array<{ date: string; max: number; min: number; mean: number }>;
  tempSymbol: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickFormatter={(value) => `${value}°`}
          width={35}
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
            `${value}${tempSymbol}`,
            name === 'max' ? '🔥 High' : name === 'min' ? '❄️ Low' : '📊 Average',
          ]}
        />
        <Area
          type="monotone"
          dataKey="max"
          stroke="#f97316"
          fillOpacity={1}
          fill="url(#colorMax)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#f97316' }}
        />
        <Area
          type="monotone"
          dataKey="min"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorMin)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#3b82f6' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function PrecipitationChart({
  data,
  precipSymbol,
}: {
  data: Array<{ date: string; precipitation: number }>;
  precipSymbol: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPrecip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickFormatter={(value) => `${value}`}
          width={35}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
            padding: '12px',
          }}
          formatter={(value) => [`${Number(value).toFixed(precipSymbol === 'in' ? 2 : 1)} ${precipSymbol}`, '🌧️ Precipitation']}
        />
        <Bar
          dataKey="precipitation"
          fill="url(#colorPrecip)"
          radius={[4, 4, 0, 0]}
          maxBarSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function CombinedChart({
  data,
  tempSymbol,
  precipSymbol,
}: {
  data: Array<{ date: string; max: number; min: number; mean: number; precipitation: number }>;
  tempSymbol: string;
  precipSymbol: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="temp"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickFormatter={(value) => `${value}°`}
          width={35}
        />
        <YAxis
          yAxisId="precip"
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickFormatter={(value) => `${value}`}
          width={30}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
            padding: '12px',
          }}
          formatter={(value, name) => {
            if (name === 'precipitation') return [`${Number(value).toFixed(1)} ${precipSymbol}`, '🌧️ Rain'];
            if (name === 'mean') return [`${value}${tempSymbol}`, '📊 Avg Temp'];
            return [value, name];
          }}
        />
        <Bar
          yAxisId="precip"
          dataKey="precipitation"
          fill="#3b82f6"
          opacity={0.3}
          radius={[4, 4, 0, 0]}
          maxBarSize={12}
        />
        <Area
          yAxisId="temp"
          type="monotone"
          dataKey="mean"
          stroke="#8b5cf6"
          fillOpacity={1}
          fill="url(#colorMean)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#8b5cf6' }}
        />
        <Line
          yAxisId="temp"
          type="monotone"
          dataKey="max"
          stroke="#f97316"
          strokeWidth={1.5}
          dot={false}
          strokeDasharray="4 2"
        />
        <Line
          yAxisId="temp"
          type="monotone"
          dataKey="min"
          stroke="#3b82f6"
          strokeWidth={1.5}
          dot={false}
          strokeDasharray="4 2"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
