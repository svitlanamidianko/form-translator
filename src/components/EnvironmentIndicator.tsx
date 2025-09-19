// Environment Indicator Component
// This shows which environment you're currently running in
// Similar to having a debug mode indicator in Python applications

import { ENVIRONMENT, API_URL, isDevelopment } from '@/config/environment';

export default function EnvironmentIndicator() {
  // Only show in development mode
  if (!isDevelopment()) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-1 text-xs font-medium z-50 rounded-bl-md">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span>
          {ENVIRONMENT.toUpperCase()} - {API_URL}
        </span>
      </div>
    </div>
  );
}
