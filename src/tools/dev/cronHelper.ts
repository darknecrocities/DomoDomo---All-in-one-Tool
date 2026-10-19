export interface CronOccurrence {
  index: number;
  date: Date;
  iso: string;
  relative: string;
  dayOfWeek: string;
  hour: number;
  minute: number;
}

// Client-side parser for standard 5-part cron: minute, hour, day-of-month, month, day-of-week
export const parseCronField = (field: string, min: number, max: number): number[] => {
  const result = new Set<number>();
  const parts = field.split(',');

  for (const part of parts) {
    if (part === '*') {
      for (let i = min; i <= max; i++) result.add(i);
    } else if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10) || 1;
      let start = min;
      let end = max;
      if (range !== '*') {
        if (range.includes('-')) {
          const [rStart, rEnd] = range.split('-').map(Number);
          start = rStart;
          end = rEnd;
        } else {
          start = parseInt(range, 10);
        }
      }
      for (let i = start; i <= end; i += step) result.add(i);
    } else if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) result.add(i);
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= min && num <= max) result.add(num);
    }
  }

  return Array.from(result).sort((a, b) => a - b);
};

export const validateCronExpression = (expression: string): { valid: boolean; error?: string } => {
  const parts = expression.trim().split(/\s+/);
  if (parts.length < 5) {
    return { valid: false, error: 'Expression must contain at least 5 parts (minute, hour, dom, mon, dow).' };
  }
  const minutes = parseCronField(parts[0], 0, 59);
  const hours = parseCronField(parts[1], 0, 23);
  const daysOfMonth = parseCronField(parts[2], 1, 31);
  const months = parseCronField(parts[3], 1, 12);
  const daysOfWeek = parseCronField(parts[4], 0, 6);

  if (minutes.length === 0) return { valid: false, error: 'Invalid minute field' };
  if (hours.length === 0) return { valid: false, error: 'Invalid hour field' };
  if (daysOfMonth.length === 0) return { valid: false, error: 'Invalid day of month field' };
  if (months.length === 0) return { valid: false, error: 'Invalid month field' };
  if (daysOfWeek.length === 0) return { valid: false, error: 'Invalid day of week field' };

  return { valid: true };
};

export const calculateCronOccurrences = (
  cronExpression: string,
  limit: number = 50,
  startDate?: Date
): CronOccurrence[] => {
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length < 5) return [];

  try {
    const minutes = parseCronField(parts[0], 0, 59);
    const hours = parseCronField(parts[1], 0, 23);
    const daysOfMonth = parseCronField(parts[2], 1, 31);
    const months = parseCronField(parts[3], 1, 12);
    const daysOfWeek = parseCronField(parts[4], 0, 6); // 0=Sunday

    const list: CronOccurrence[] = [];
    const cursor = startDate ? new Date(startDate) : new Date();
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1); // Start from next minute

    let iterations = 0;
    const maxIterations = 50000;
    const now = startDate ? startDate.getTime() : Date.now();

    while (list.length < limit && iterations < maxIterations) {
      iterations++;
      const m = cursor.getMinutes();
      const h = cursor.getHours();
      const dom = cursor.getDate();
      const mon = cursor.getMonth() + 1;
      const dow = cursor.getDay();

      if (
        minutes.includes(m) &&
        hours.includes(h) &&
        daysOfMonth.includes(dom) &&
        months.includes(mon) &&
        daysOfWeek.includes(dow)
      ) {
        const runDate = new Date(cursor);
        const diffMs = runDate.getTime() - now;
        const diffMin = Math.round(diffMs / 60000);
        const relText =
          diffMin < 60
            ? `in ${diffMin}m`
            : diffMin < 1440
            ? `in ${Math.floor(diffMin / 60)}h ${diffMin % 60}m`
            : `in ${Math.floor(diffMin / 1440)}d ${Math.floor((diffMin % 1440) / 60)}h`;

        list.push({
          index: list.length + 1,
          date: runDate,
          iso: runDate.toISOString(),
          relative: relText,
          dayOfWeek: runDate.toLocaleDateString('en-US', { weekday: 'short' }),
          hour: h,
          minute: m,
        });
      }

      cursor.setMinutes(cursor.getMinutes() + 1);
    }

    return list;
  } catch {
    return [];
  }
};
