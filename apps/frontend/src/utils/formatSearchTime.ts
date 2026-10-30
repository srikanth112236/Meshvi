/**
 * Human-friendly timestamp for recent searches.
 * "Just now" · "4m ago" · "Today, 3:42 PM" · "Yesterday, 9:10 AM" · "Oct 24, 3:42 PM"
 */
export const formatSearchTime = (timestamp: number, now: number = Date.now()): string => {
  const then = new Date(timestamp);
  if (Number.isNaN(then.getTime())) return '';

  const diffMs = Math.max(0, now - timestamp);
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const time = then.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (then >= startOfToday) return `Today, ${time}`;
  if (then >= startOfYesterday) return `Yesterday, ${time}`;

  const date = then.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${date}, ${time}`;
};

/** Full date + time for tooltips. */
export const formatSearchDateTime = (timestamp: number): string => {
  const then = new Date(timestamp);
  if (Number.isNaN(then.getTime())) return '';
  return then.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
