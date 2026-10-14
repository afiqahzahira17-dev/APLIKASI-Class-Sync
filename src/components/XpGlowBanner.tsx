import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Trophy, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const XpGlowBanner: React.FC = () => {
  const { lastXpGainNotice, clearXpGainNotice } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastXpGainNotice) {
      setVisible(true);

      // Trigger sparkles confetti burst
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.15 },
          colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
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
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
      <div
        className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 ${
          isPenalty
            ? 'bg-rose-950/90 border-rose-500 text-white ring-4 ring-rose-500/40 shadow-rose-900/50'
            : 'bg-amber-950/90 border-amber-400 text-white ring-4 ring-amber-400/50 shadow-[0_0_35px_rgba(245,158,11,0.6)] animate-pulse'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-md ${
              isPenalty
                ? 'bg-rose-600 text-white'
                : 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
            }`}
          >
            {isPenalty ? <AlertTriangle className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-spin" />}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white">
                {isPenalty ? '⚠️ Pinalti XP' : '✨ XP MENYALA & BERTAMBAH!'}
              </span>
              <span
                className={`text-sm font-black font-mono ${
                  isPenalty ? 'text-rose-300' : 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]'
                }`}
              >
                {isPenalty ? `${lastXpGainNotice.amount} XP` : `+${lastXpGainNotice.amount} XP`}
              </span>
            </div>

            <p className="text-xs font-medium text-slate-100 mt-0.5 leading-snug">
              {lastXpGainNotice.reason}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setVisible(false);
            clearXpGainNotice();
          }}
          className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
