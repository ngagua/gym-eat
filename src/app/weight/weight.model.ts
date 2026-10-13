/** One weigh-in. `date` is a local calendar day, 'YYYY-MM-DD', the format `<input type="date">` uses. */
export interface WeightEntry {
  date: string;
  kg: number;
}

/** What the Weight service keeps on this device. */
export interface SavedWeight {
  /** Oldest first, at most one per day. */
  entries: WeightEntry[];
  target: number | null;
}

/** The weigh-in form; `kg` is null while the field is empty. */
export interface WeighIn {
  date: string;
  kg: number | null;
}

/** The target form. */
export interface TargetWeight {
  kg: number | null;
}

/** A weigh-in placed on the weight chart, in px. */
export interface ChartPoint extends WeightEntry {
  x: number;
  y: number;
}

/** The weigh-in under the pointer, with where its tooltip goes. */
export interface ActivePoint extends ChartPoint {
  tipX: number;
  tipY: number;
}

/** A kg gridline. */
export interface KgTick {
  kg: number;
  y: number;
}

/** A date label under the chart; `ms` is UTC midnight of that day. */
export interface DateTick {
  ms: number;
  x: number;
  anchor: 'start' | 'middle' | 'end';
}

/** The weights the app accepts, in kg. */
export const MIN_KG = 30;
export const MAX_KG = 300;
export const KG_RANGE_MESSAGE = `Enter a weight from ${MIN_KG} to ${MAX_KG} kg.`;

export const WEIGHT_STORAGE_KEY = 'gymeat.weight';

/** How many weigh-ins the Weight page lists; the chart shows them all. */
export const RECENT_COUNT = 14;

export const DAY_MS = 86_400_000;

/**
 * The weight chart's plot area in px. The chart is as wide as its container, so the plot's right
 * edge is the width minus `rightPad`.
 */
export const CHART = { height: 240, top: 16, bottom: 212, left: 36, rightPad: 14 };

/** The hover tooltip's size in px. */
export const TIP = { width: 150, height: 28 };

/** Local calendar day as 'YYYY-MM-DD'. */
export const isoDay = (date: Date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((n) => String(n).padStart(2, '0'))
    .join('-');

/** Weights are logged to 0.1 kg; this also hides float noise like 85.9 - 80 = 5.900000000000006. */
export const roundKg = (kg: number) => Math.round(kg * 10) / 10;

/** Adds a weigh-in, replacing any on the same day, and keeps the list in date order. */
export const withEntry = (entries: WeightEntry[], entry: WeightEntry) =>
  [...entries.filter((e) => e.date !== entry.date), entry].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

const isKg = (kg: unknown): kg is number => typeof kg === 'number' && kg >= MIN_KG && kg <= MAX_KG;

const isEntry = (entry: unknown): entry is WeightEntry =>
  typeof entry === 'object' &&
  entry !== null &&
  'date' in entry &&
  'kg' in entry &&
  typeof entry.date === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
  isKg(entry.kg);

/**
 * Reads back what the Weight service saved. Storage can be edited by hand or hold an older format,
 * so malformed weigh-ins are dropped one by one instead of losing the whole log.
 */
export function parseSavedWeight(json: string | null): SavedWeight {
  const empty: SavedWeight = { entries: [], target: null };
  if (!json) return empty;
  try {
    const data: unknown = JSON.parse(json);
    if (typeof data !== 'object' || data === null) return empty;
    const entries =
      'entries' in data && Array.isArray(data.entries) ? data.entries.filter(isEntry) : [];
    const target = 'target' in data && isKg(data.target) ? data.target : null;
    return { entries: entries.reduce<WeightEntry[]>(withEntry, []), target };
  } catch {
    return empty;
  }
}

/**
 * Steps of 1, 2, 5 or 10 kg between gridlines, the smallest that keeps it to about six lines,
 * with the range widened to whole steps so every line sits on a round number.
 */
export function kgAxis(kgs: number[]) {
  const low = Math.min(...kgs) - 0.5;
  const high = Math.max(...kgs) + 0.5;
  const step = [1, 2, 5, 10].find((s) => (high - low) / s <= 5) ?? 20;
  const min = Math.floor(low / step) * step;
  const max = Math.ceil(high / step) * step;
  const ticks = Array.from(
    { length: Math.round((max - min) / step) + 1 },
    (_, i) => min + i * step,
  );
  return { min, max, ticks };
}
