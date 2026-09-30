import React, { useState, useEffect } from 'react';
import {
  Database,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Server,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import {
  supabase,
  SUPABASE_URL,
  SUPABASE_SQL_SCHEMA,
  SUPABASE_GRANT_SQL,
} from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncNow?: () => Promise<void>;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onSyncNow,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSqlTab, setActiveSqlTab] = useState<'grant' | 'schema'>('grant');
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<
    'checking' | 'connected_tables_ready' | 'connected_tables_missing' | 'permission_denied' | 'error'
  >('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const checkStatus = async () => {
    setIsChecking(true);
    setErrorMessage('');
    try {
      const { data, error } = await supabase.from('classes').select('id').limit(1);
      if (error) {
        if (
          error.code === '42501' ||
          error.message?.toLowerCase().includes('permission denied')
        ) {
          setStatus('permission_denied');
          setActiveSqlTab('grant');
          setErrorMessage(error.message);
        } else if (
          error.code === 'PGRST205' ||
          error.message?.includes('schema cache') ||
          error.message?.includes('relation') ||
          error.message?.includes('does not exist')
        ) {
          setStatus('connected_tables_missing');
          setActiveSqlTab('schema');
        } else {
          setStatus('error');
          setErrorMessage(error.message);
        }
      } else {
        setStatus('connected_tables_ready');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Gagal menghubungi server Supabase');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const handleCopySql = () => {
    const textToCopy = activeSqlTab === 'grant' ? SUPABASE_GRANT_SQL : SUPABASE_SQL_SCHEMA;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Integrasi Database Supabase</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Cloud DB
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs sm:max-w-md mt-0.5">
                {SUPABASE_URL}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Box */}
        <div className="p-3.5 rounded-xl border bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status Koneksi:
              </span>
            </div>
            <button
              onClick={checkStatus}
              disabled={isChecking}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Cek Ulang</span>
            </button>
          </div>

          {status === 'checking' && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Memeriksa status Supabase...</span>
            </div>
          )}

          {status === 'connected_tables_ready' && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Terhubung & Tabel Database Siap Digunakan! Data tersinkronisasi otomatis.</span>
            </div>
          )}

          {status === 'permission_denied' && (
            <div className="space-y-1.5 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Koneksi Berhasil, Diperlukan Izin Akses (GRANT Privileges)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                Tabel database sudah ada di Supabase, tetapi role publik <b>anon</b> belum diberikan izin akses (Error 42501 permission denied). Jalankan <b>Skrip Izin GRANT</b> di bawah pada SQL Editor Supabase untuk langsung mengaktifkannya.
              </p>
            </div>
          )}

          {status === 'connected_tables_missing' && (
            <div className="space-y-1.5 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Supabase Terhubung, Tabel Belum Dibuat</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
                Kredensial URL & Key Anda berhasil terverifikasi. Untuk mengaktifkan penyimpanan tabel di cloud, silakan salin skrip SQL di bawah dan jalankan di Supabase SQL Editor.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
              Gagal menghubungi database: {errorMessage}
            </div>
          )}
        </div>

        {/* Action: Copy SQL script for Supabase Dashboard */}
        <div className="space-y-2">
          {/* Script Type Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveSqlTab('grant')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeSqlTab === 'grant'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Skrip Izin GRANT (Solusi Cepat)
              </button>
              <button
                type="button"
                onClick={() => setActiveSqlTab('schema')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeSqlTab === 'schema'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Skrip Lengkap Tabel (Schema)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://supabase.com/dashboard/project/bcrsqzmantitndqtnecs/sql"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 flex items-center gap-1"
              >
                <span>Buka SQL Editor</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={handleCopySql}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{activeSqlTab === 'grant' ? 'Salin Skrip GRANT' : 'Salin Skrip SQL'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800 leading-relaxed select-all">
              {activeSqlTab === 'grant' ? SUPABASE_GRANT_SQL : SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800/70 p-3 rounded-xl space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <p className="font-bold text-slate-800 dark:text-slate-100">
              {activeSqlTab === 'grant'
                ? 'Langkah Cepat Memperbaiki Izin GRANT di Supabase:'
                : 'Langkah Mengaktifkan Tabel di Supabase:'}
            </p>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              <li>
                Klik tombol <b>{activeSqlTab === 'grant' ? '"Salin Skrip GRANT"' : '"Salin Skrip SQL"'}</b> di atas.
              </li>
              <li>
                Buka link <b>Buka SQL Editor</b> di kanan atas atau buka project Supabase Anda.
              </li>
              <li>
                Klik <b>New query</b>, tempel skrip tersebut, lalu klik <b>Run</b> (Ctrl+Enter).
              </li>
              <li>
                Kembali ke sini dan klik tombol <b>"Cek Ulang"</b> di atas. Status akan langsung berubah hijau / Siap!
              </li>
            </ol>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
          {onSyncNow && status === 'connected_tables_ready' && (
            <button
              onClick={async () => {
                await onSyncNow();
                onClose();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              Sinkronkan Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
