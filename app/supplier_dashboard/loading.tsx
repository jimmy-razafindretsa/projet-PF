import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in w-full">
      <div className="relative">
        {/* Outer subtle ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 opacity-50"></div>
        {/* Inner spinning loader */}
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 tracking-wider uppercase animate-pulse">Loading Dashboard...</p>
    </div>
  );
}
