import { effect, Service, signal } from '@angular/core';
import {
  parseSavedWeight,
  roundKg,
  SavedWeight,
  WEIGHT_STORAGE_KEY,
  withEntry,
} from './weight.model';

/** Your weigh-ins and target weight, kept on this device. With accounts they move to Supabase. */
@Service()
export class WeightLog {
  private readonly saved = this.read();
  private readonly entryList = signal(this.saved.entries);
  private readonly targetKg = signal(this.saved.target);

  /** Oldest first, at most one per day. */
  readonly entries = this.entryList.asReadonly();
  readonly target = this.targetKg.asReadonly();
  /** True when the browser refused to store the log (private mode, site settings, full storage). */
  readonly saveFailed = signal(false);

  constructor() {
    effect(() => {
      const data: SavedWeight = { entries: this.entries(), target: this.target() };
      try {
        localStorage.setItem(WEIGHT_STORAGE_KEY, JSON.stringify(data));
        this.saveFailed.set(false);
      } catch {
        this.saveFailed.set(true);
      }
    });
  }

  /** Logs a weight for a day, replacing that day's earlier weigh-in. */
  log(date: string, kg: number): void {
    this.entryList.update((entries) => withEntry(entries, { date, kg: roundKg(kg) }));
  }

  remove(date: string): void {
    this.entryList.update((entries) => entries.filter((e) => e.date !== date));
  }

  setTarget(kg: number): void {
    this.targetKg.set(roundKg(kg));
  }

  private read(): SavedWeight {
    try {
      return parseSavedWeight(localStorage.getItem(WEIGHT_STORAGE_KEY));
    } catch {
      return parseSavedWeight(null);
    }
  }
}
