import React from 'react';
import { useApp } from '../context/AppContext';
import { Wifi, BatteryMedium, Signal, Smartphone } from 'lucide-react';

interface MobileDeviceShellProps {
  children: React.ReactNode;
}

export const MobileDeviceShell: React.FC<MobileDeviceShellProps> = ({ children }) => {
  const { isMobileDeviceFrame, setIsMobileDeviceFrame, witaTimeInfo } = useApp();

  if (!isMobileDeviceFrame) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0B1E25] text-[#163E4B] dark:text-[#F2F6F7] transition-colors relative overflow-x-hidden">
        <div className="max-w-3xl mx-auto min-h-screen relative flex flex-col">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#CFD8DC] dark:bg-[#08161C] p-4 sm:p-6 flex flex-col items-center justify-center transition-colors relative overflow-hidden">
      {/* Top Controller helper */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[420px] px-2 text-xs text-[#163E4B] dark:text-[#B9CFD6]">
        <span className="font-bold flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-[#163E4B] dark:text-[#F4A950]" />
          Mode Bingkai Mobile (412 × 890px)
        </span>
        <button
          onClick={() => setIsMobileDeviceFrame(false)}
          className="text-xs text-[#163E4B] dark:text-[#F4A950] font-bold hover:underline cursor-pointer"
        >
          Ganti ke Layar Penuh
        </button>
      </div>

      {/* White Bezel Realistic Mobile Frame matching reference design */}
      <div className="w-full max-w-[412px] h-[860px] bg-[#F7F7F5] dark:bg-[#0B1E25] rounded-[46px] shadow-[0_28px_65px_rgba(22,62,75,0.2)] border-[10px] border-white dark:border-[#163E4B] overflow-hidden relative flex flex-col ring-1 ring-[#163E4B]/10">
        {/* Status Bar */}
        <div className="h-10 bg-[#F7F7F5]/95 dark:bg-[#0B1E25]/95 px-6 flex items-center justify-between text-xs font-semibold text-[#163E4B] dark:text-[#E5EEF0] shrink-0 z-50 select-none">
          <span className="font-mono tabular-nums text-[11px] font-bold">
            {witaTimeInfo.formattedTime} WITA
          </span>

          <div className="flex items-center gap-1.5 text-[#163E4B]/80 dark:text-[#E5EEF0]/80">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryMedium className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Scrollable App View Inside Phone */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col no-scrollbar">
          {children}
        </div>

        {/* Home Indicator Bar matching reference phone frame */}
        <div className="h-5 bg-white dark:bg-[#112B35] flex items-center justify-center shrink-0 z-50">
          <div className="w-32 h-1 bg-[#163E4B] dark:bg-[#F4A950]/70 rounded-full" />
        </div>
      </div>
    </div>
  );
};
