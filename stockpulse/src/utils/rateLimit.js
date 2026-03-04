const DAILY_LIMIT = 3;
const KEY = 'sp_usage'; // localStorage key

function getStored() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function checkRateLimit() {
  const today = new Date().toDateString();
  const stored = getStored();
  if (stored.date !== today) return { allowed: true, remaining: DAILY_LIMIT };
  const remaining = Math.max(0, DAILY_LIMIT - (stored.count || 0));
  return { allowed: remaining > 0, remaining };
}

export function incrementUsage() {
  const today = new Date().toDateString();
  const stored = getStored();
  const count = (stored.date === today ? stored.count || 0 : 0) + 1;
  try {
    localStorage.setItem(KEY, JSON.stringify({ date: today, count }));
  } catch {
    // ignore (private browsing, etc.)
  }
}

export function getRemainingSearches() {
  return checkRateLimit().remaining;
}
