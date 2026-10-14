// Utility for Waktu Indonesia Tengah (WITA - UTC+8, Asia/Makassar)

export interface WitaTimeInfo {
  date: Date;
  dayOfWeek: number; // 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu, 7 = Minggu
  dayName: string;
  formattedDate: string; // e.g. "Rabu, 14 Oktober 2026"
  formattedTime: string; // "08:15"
  formattedTimeWithSeconds: string; // "08:15:30"
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number; // hours * 60 + minutes
  timezoneLabel: string; // "WITA (UTC+8)"
}

export const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const INDO_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Mendapatkan informasi waktu saat ini berdasarkan Waktu Indonesia Tengah (WITA, UTC+8).
 * Menggunakan standar IANA timezone 'Asia/Makassar' dengan hourCycle: 'h23' untuk presisi 24 jam.
 */
export const getWitaNow = (baseDate: Date = new Date()): WitaTimeInfo => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(baseDate);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = parseInt(partMap.year || '2026', 10);
  const month = parseInt(partMap.month || '10', 10); // 1-12
  const day = parseInt(partMap.day || '14', 10);
  let hour = parseInt(partMap.hour || '0', 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(partMap.minute || '0', 10);
  const second = parseInt(partMap.second || '0', 10);

  // Buat objek Date lokal untuk perhitungan hari
  const witaDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const rawDay = witaDate.getUTCDay(); // 0 = Minggu, 1 = Senin, ...
  const dayOfWeek = rawDay === 0 ? 7 : rawDay; // Konversi ke 1 = Senin ... 7 = Minggu

  const dayName = INDO_DAYS[rawDay];
  const monthName = INDO_MONTHS[month - 1];
  const formattedDate = `${dayName}, ${day} ${monthName} ${year}`;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedTime = `${pad(hour)}:${pad(minute)}`;
  const formattedTimeWithSeconds = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
  const totalMinutes = hour * 60 + minute;

  return {
    date: witaDate,
    dayOfWeek,
    dayName,
    formattedDate,
    formattedTime,
    formattedTimeWithSeconds,
    hours: hour,
    minutes: minute,
    seconds: second,
    totalMinutes,
    timezoneLabel: 'WITA (UTC+8)',
  };
};

/**
 * Konversi "HH:mm" menjadi total menit sejak tengah malam
 */
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Format total menit menjadi string "HH:mm"
 */
export const minutesToTimeString = (totalMinutes: number): string => {
  const norm = Math.max(0, Math.min(1439, totalMinutes));
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Cek apakah kelas sedang berlangsung berdasarkan waktu saat ini
 */
export const isClassCurrentlyLive = (
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  currentDayOfWeek: number,
  currentMinutes: number
): boolean => {
  if (dayOfWeek !== currentDayOfWeek) return false;
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  return currentMinutes >= startMin && currentMinutes < endMin;
};

export interface ClassProgressInfo {
  isLive: boolean;
  isCompleted: boolean;
  isUpcoming: boolean;
  percent: number; // 0 - 100
  elapsedMinutes: number;
  remainingMinutes: number;
  remainingSeconds: number;
  formattedRemaining: string; // e.g. "32 menit 15 detik"
}

/**
 * Menghitung progres real-time kelas yang sedang berjalan dengan presisi detik
 */
export const calculateClassProgress = (
  startTime: string,
  endTime: string,
  currentMinutes: number,
  currentSeconds: number = 0
): ClassProgressInfo => {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const totalDurationMinutes = Math.max(1, endMin - startMin);
  const totalDurationSeconds = totalDurationMinutes * 60;

  const currentTotalSeconds = currentMinutes * 60 + currentSeconds;
  const startTotalSeconds = startMin * 60;
  const endTotalSeconds = endMin * 60;

  if (currentTotalSeconds < startTotalSeconds) {
    const untilStartTotalSeconds = Math.max(0, startTotalSeconds - currentTotalSeconds);
    const untilM = Math.floor(untilStartTotalSeconds / 60);
    const untilS = untilStartTotalSeconds % 60;
    return {
      isLive: false,
      isCompleted: false,
      isUpcoming: true,
      percent: 0,
      elapsedMinutes: 0,
      remainingMinutes: untilM,
      remainingSeconds: untilS,
      formattedRemaining: `${untilM} mnt ${untilS} dtk`,
    };
  }

  if (currentTotalSeconds >= endTotalSeconds) {
    return {
      isLive: false,
      isCompleted: true,
      isUpcoming: false,
      percent: 100,
      elapsedMinutes: totalDurationMinutes,
      remainingMinutes: 0,
      remainingSeconds: 0,
      formattedRemaining: '0 detik',
    };
  }

  const elapsedSeconds = currentTotalSeconds - startTotalSeconds;
  const remainingTotalSeconds = Math.max(0, endTotalSeconds - currentTotalSeconds);
  const remMinutes = Math.floor(remainingTotalSeconds / 60);
  const remSecs = remainingTotalSeconds % 60;
  const percent = Math.min(100, Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100));

  return {
    isLive: true,
    isCompleted: false,
    isUpcoming: false,
    percent: Math.round(percent * 10) / 10,
    elapsedMinutes: Math.floor(elapsedSeconds / 60),
    remainingMinutes: remMinutes,
    remainingSeconds: remSecs,
    formattedRemaining:
      remMinutes > 0 ? `${remMinutes} menit ${remSecs} detik` : `${remSecs} detik`,
  };
};

/**
 * Format tanggal ISO ke format lengkap WITA
 */
export const formatWitaFull = (isoDateOrDate: string | Date): string => {
  try {
    const d = typeof isoDateOrDate === 'string' ? new Date(isoDateOrDate) : isoDateOrDate;
    const info = getWitaNow(d);
    return `${info.formattedDate} • ${info.formattedTime} WITA`;
  } catch {
    return String(isoDateOrDate);
  }
};
