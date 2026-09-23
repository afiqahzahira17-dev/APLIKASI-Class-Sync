import React from 'react';
import { useApp } from '../context/AppContext';
import { Wifi, BatteryMedium, Signal, Smartphone } from 'lucide-react';

interface MobileDeviceShellProps {
  children: React.ReactNode;
}

export const MobileDeviceShell: React.FC<MobileDeviceShellProps> = ({ children }) => {
  const { isMobileDeviceFrame, setIsMobileDeviceFrame, simulatedTime } = useApp();

  if (!isMobileDeviceFrame) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="max-w-2xl mx-auto min-h-screen relative flex flex-col">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center transition-colors">
      {/* Top Controller helper */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[420px] px-2 text-xs text-slate-600 dark:text-slate-400">
        <span className="font-semibold flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
          Mode Bingkai Mobile (412 × 890px)
        </span>
        <button
          onClick={() => setIsMobileDeviceFrame(false)}
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          Ganti ke Layar Penuh
        </button>
      </div>

      {/* Realistic Mobile Device Frame */}
      <div className="w-full max-w-[412px] h-[860px] bg-white dark:bg-slate-900 rounded-[44px] shadow-2xl border-[10px] border-slate-900 dark:border-slate-800 overflow-hidden relative flex flex-col ring-1 ring-black/10">
        {/* Status Bar */}
        <div className="h-10 bg-white/95 dark:bg-slate-900/95 px-6 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 shrink-0 z-50 select-none">
          <span className="font-mono text-[11px]">{simulatedTime}</span>

          {/* Dynamic Island Pill */}
          <div className="w-24 h-4.5 bg-black rounded-full mx-auto" />

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryMedium className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Scrollable App View Inside Phone */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col no-scrollbar">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="h-4 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 z-50">
          <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
