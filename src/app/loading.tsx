import { SkeletonWeatherCard, SkeletonHourlyForecast, SkeletonDailyForecast, SkeletonChart } from '@/components/ui';

export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="hidden sm:block space-y-1">
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex-1 max-w-md h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            <SkeletonWeatherCard className="h-80" />
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
              <SkeletonHourlyForecast />
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
              <SkeletonDailyForecast />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
              <SkeletonChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
