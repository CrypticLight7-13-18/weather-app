'use client';

import { CloudOff, RefreshCw, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#e8eef5] dark:bg-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center"
        >
          <CloudOff className="w-12 h-12 text-slate-500 dark:text-slate-400" />
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white mb-3">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          It looks like you&apos;ve lost your internet connection. 
          Check your network settings and try again.
        </p>

        {/* Connection status */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <Wifi className="w-4 h-4" />
          <span>No internet connection</span>
        </div>

        {/* Retry button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/25"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </motion.button>

        {/* Tip */}
        <p className="mt-8 text-sm text-slate-500 dark:text-slate-500">
          💡 Previously viewed locations may still be available from cache
        </p>
      </motion.div>
    </div>
  );
}

