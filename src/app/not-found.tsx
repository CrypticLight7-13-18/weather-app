import Link from 'next/link';
import { Button } from '@/components/ui';
import { CloudOff, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <CloudOff className="h-10 w-10 text-slate-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
          404
        </h1>
        
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">
          Page Not Found
        </h2>
        
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

