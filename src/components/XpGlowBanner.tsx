import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, AlertTriangle, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const XpGlowBanner: React.FC = () => {
  const { lastXpGainNotice, clearXpGainNotice } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastXpGainNotice) {
      setVisible(true);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.15 },
          colors: ['#F4A950', '#163E4B', '#FCEADE', '#10B981'],
        });
      } catch {}

      const timer = setTimeout(() => {
        setVisible(false);
        clearXpGainNotice();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [lastXpGainNotice, clearXpGainNotice]);

  if (!visible || !lastXpGainNotice) return null;

  const isPenalty = lastXpGainNotice.amount < 0;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none">
      <div
        className={`pointer-events-auto p-4 rounded-[24px] border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 ${
          isPenalty
            ? 'bg-[#3D181E]/95 border-rose-400/60 text-white'
            : 'bg-[#163E4B]/95 border-[#F4A950] text-white shadow-[0_14px_35px_rgba(22,62,75,0.35)]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-xs ${
              isPenalty
                ? 'bg-rose-500 text-white'
                : 'bg-[#F4A950] text-white'
            }`}
          >
            {isPenalty ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#FCEADE]">
                {isPenalty ? 'Pinalti XP' : 'Poin XP Bertambah'}
              </span>
              <span
                className={`text-sm font-extrabold font-mono tabular-nums ${
                  isPenalty ? 'text-rose-300' : 'text-[#F4A950]'
                }`}
              >
                {isPenalty ? `${lastXpGainNotice.amount} XP` : `+${lastXpGainNotice.amount} XP`}
              </span>
            </div>

            <p className="text-xs font-medium text-white/90 mt-0.5 leading-snug">
              {lastXpGainNotice.reason}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setVisible(false);
            clearXpGainNotice();
          }}
          className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
