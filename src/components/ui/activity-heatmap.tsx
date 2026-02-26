'use client';

type Props = {
  data: Record<string, number>; // date string -> count
};

const LEVELS = ['bg-gray-100 dark:bg-gray-800', 'bg-green-200 dark:bg-green-900', 'bg-green-400 dark:bg-green-700', 'bg-green-600 dark:bg-green-500', 'bg-green-800 dark:bg-green-400'];

function getLevel(count: number): string {
  if (count === 0) return LEVELS[0];
  if (count <= 2) return LEVELS[1];
  if (count <= 5) return LEVELS[2];
  if (count <= 10) return LEVELS[3];
  return LEVELS[4];
}

export function ActivityHeatmap({ data }: Props) {
  // Generate last 12 weeks (84 days)
  const days: { date: string; count: number }[] = [];
  const today = new Date();

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({ date: dateStr, count: data[dateStr] ?? 0 });
  }

  // Group by weeks (columns)
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-gray-500">Activity (last 12 weeks)</h4>
      <div className="flex gap-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day) => (
              <div
                key={day.date}
                className={`h-3 w-3 rounded-sm ${getLevel(day.count)}`}
                title={`${day.date}: ${day.count} activity`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
