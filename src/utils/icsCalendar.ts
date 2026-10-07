import { ScheduleItem } from '../types';

// Map day of week (1 = Senin, ... 6 = Sabtu) to iCal BYDAY code
const DAY_TO_BYDAY: Record<number, string> = {
  1: 'MO',
  2: 'TU',
  3: 'WE',
  4: 'TH',
  5: 'FR',
  6: 'SA',
  7: 'SU',
};

const BYDAY_TO_DAY: Record<string, number> = {
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
  SU: 7,
};

/**
 * Generate standard RFC 5545 .ics content for all schedules in a class
 */
export const generateIcsCalendar = (
  className: string,
  schedules: ScheduleItem[]
): string => {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ClassyWork//Jadwal Pelajaran Sekolah//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Jadwal KBM ${className}`,
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  // Reference base date (Monday of current week in 2026: 2026-10-05 is Monday)
  // Day offsets: 1 = Mon (Oct 5), 2 = Tue (Oct 6), 3 = Wed (Oct 7), 4 = Thu (Oct 8), 5 = Fri (Oct 9), 6 = Sat (Oct 10)
  const baseYear = 2026;
  const baseMonth = '10';

  schedules.forEach((sch) => {
    const dayNum = sch.dayOfWeek;
    const dayDate = (4 + dayNum).toString().padStart(2, '0'); // Oct 05 is Monday (1 + 4 = 5)
    const byDay = DAY_TO_BYDAY[dayNum] || 'MO';

    const [startH, startM] = sch.startTime.split(':');
    const [endH, endM] = sch.endTime.split(':');

    const dtStart = `${baseYear}${baseMonth}${dayDate}T${startH.padStart(2, '0')}${startM.padStart(2, '0')}00`;
    const dtEnd = `${baseYear}${baseMonth}${dayDate}T${endH.padStart(2, '0')}${endM.padStart(2, '0')}00`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:sch-${sch.id}@classywork.app`);
    lines.push(`DTSTAMP:${baseYear}1001T000000Z`);
    lines.push(`SUMMARY:${sch.subjectName} (${sch.teacherName || 'Guru Pengampu'})`);
    lines.push(
      `DESCRIPTION:Mata Pelajaran: ${sch.subjectName}\\nGuru: ${sch.teacherName}\\nRuang: ${sch.roomLocation}${
        sch.notes ? '\\nCatatan: ' + sch.notes : ''
      }`
    );
    if (sch.roomLocation) {
      lines.push(`LOCATION:${sch.roomLocation}`);
    }
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`);
    lines.push(`DTSTART;TZID=Asia/Jakarta:${dtStart}`);
    lines.push(`DTEND;TZID=Asia/Jakarta:${dtEnd}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};

/**
 * Trigger file download of .ics calendar
 */
export const downloadIcsFile = (filename: string, icsContent: string): void => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export interface ParsedScheduleCandidate {
  subjectName: string;
  teacherName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomLocation: string;
  colorTheme: string;
  notes?: string;
}

/**
 * Parse an uploaded .ics string into schedule candidates
 */
export const parseIcsContent = (icsText: string): ParsedScheduleCandidate[] => {
  const events: ParsedScheduleCandidate[] = [];
  const lines = icsText.split(/\r\n|\n|\r/);

  let inEvent = false;
  let currentSummary = '';
  let currentLocation = '';
  let currentDescription = '';
  let currentDtStart = '';
  let currentDtEnd = '';
  let currentRrule = '';

  const processEvent = () => {
    if (!currentSummary && !currentDescription) return;

    // Detect subject and teacher from Summary
    // e.g., "MATEMATIKA (Drs. Budi)" or "MATEMATIKA - Drs. Budi" or just "MATEMATIKA"
    let subject = currentSummary || 'Mata Pelajaran';
    let teacher = '';

    const parenMatch = currentSummary.match(/^(.*?)\s*\((.*?)\)$/);
    const dashMatch = currentSummary.match(/^(.*?)\s*-\s*(.*)$/);

    if (parenMatch) {
      subject = parenMatch[1].trim();
      teacher = parenMatch[2].trim();
    } else if (dashMatch) {
      subject = dashMatch[1].trim();
      teacher = dashMatch[2].trim();
    }

    // Determine Day of Week
    let day = 1; // default Monday
    const byDayMatch = currentRrule.match(/BYDAY=([A-Z]{2})/i);
    if (byDayMatch && BYDAY_TO_DAY[byDayMatch[1].toUpperCase()]) {
      day = BYDAY_TO_DAY[byDayMatch[1].toUpperCase()];
    } else if (currentDtStart) {
      // Try parsing date string like 20261005T073000
      const dateStr = currentDtStart.replace(/^.*?(\d{8}).*$/, '$1');
      if (dateStr.length === 8) {
        const y = parseInt(dateStr.slice(0, 4), 10);
        const m = parseInt(dateStr.slice(4, 6), 10) - 1;
        const d = parseInt(dateStr.slice(6, 8), 10);
        const jsDay = new Date(y, m, d).getDay(); // 0 is Sunday, 1 is Monday...
        day = jsDay === 0 ? 7 : jsDay;
      }
    }

    // Determine Start and End times
    let startTime = '07:30';
    let endTime = '09:00';

    const extractTime = (dtStr: string): string | null => {
      const timeMatch = dtStr.match(/T(\d{2})(\d{2})/);
      if (timeMatch) {
        return `${timeMatch[1]}:${timeMatch[2]}`;
      }
      return null;
    };

    const parsedStart = extractTime(currentDtStart);
    const parsedEnd = extractTime(currentDtEnd);

    if (parsedStart) startTime = parsedStart;
    if (parsedEnd) {
      endTime = parsedEnd;
    } else if (parsedStart) {
      // Default duration: 90 minutes
      const [h, m] = startTime.split(':').map(Number);
      const endTotal = h * 60 + m + 90;
      const endH = Math.min(23, Math.floor(endTotal / 60)).toString().padStart(2, '0');
      const endM = (endTotal % 60).toString().padStart(2, '0');
      endTime = `${endH}:${endM}`;
    }

    const colors = ['blue', 'emerald', 'purple', 'amber', 'cyan', 'rose'];
    const chosenColor = colors[events.length % colors.length];

    events.push({
      subjectName: subject,
      teacherName: teacher || 'Guru Pengampu',
      dayOfWeek: day > 6 ? 1 : day, // keep 1-6 (Mon-Sat)
      startTime,
      endTime,
      roomLocation: currentLocation || 'Ruang Kelas',
      colorTheme: chosenColor,
      notes: currentDescription.slice(0, 100),
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentSummary = '';
      currentLocation = '';
      currentDescription = '';
      currentDtStart = '';
      currentDtEnd = '';
      currentRrule = '';
    } else if (line === 'END:VEVENT') {
      inEvent = false;
      processEvent();
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentSummary = line.replace('SUMMARY:', '').trim();
      } else if (line.startsWith('LOCATION:')) {
        currentLocation = line.replace('LOCATION:', '').trim();
      } else if (line.startsWith('DESCRIPTION:')) {
        currentDescription = line.replace('DESCRIPTION:', '').replace(/\\n/g, ' ').trim();
      } else if (line.startsWith('DTSTART')) {
        currentDtStart = line.replace(/^DTSTART.*?:/, '').trim();
      } else if (line.startsWith('DTEND')) {
        currentDtEnd = line.replace(/^DTEND.*?:/, '').trim();
      } else if (line.startsWith('RRULE:')) {
        currentRrule = line.replace('RRULE:', '').trim();
      }
    }
  }

  return events;
};
