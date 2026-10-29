function getLocalDateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

export function formatDayLabel(date: string, timeZone: string, referenceDate = new Date()): string {
  const today = getLocalDateKey(referenceDate, timeZone);
  const [todayYear, todayMonth, todayDay] = today.split('-').map(Number);
  const tomorrow = new Date(Date.UTC(todayYear, todayMonth - 1, todayDay + 1))
    .toISOString()
    .slice(0, 10);
  const [year, month, day] = date.split('-').map(Number);

  if (date === today) {
    return 'Hoje';
  }

  if (date === tomorrow) {
    return 'Amanhã';
  }

  const dateAtUtcNoon = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(dateAtUtcNoon);
}
