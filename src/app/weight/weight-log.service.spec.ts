import { TestBed } from '@angular/core/testing';
import { WeightLog } from './weight-log.service';
import { kgAxis, parseSavedWeight, WEIGHT_STORAGE_KEY } from './weight.model';

describe('WeightLog', () => {
  beforeEach(() => localStorage.clear());

  it('keeps one weigh-in per day, in date order, rounded to 0.1 kg', () => {
    const log = TestBed.inject(WeightLog);
    log.log('2026-10-13', 85.9);
    log.log('2026-10-11', 86.24);
    log.log('2026-10-13', 85.6);

    expect(log.entries()).toEqual([
      { date: '2026-10-11', kg: 86.2 },
      { date: '2026-10-13', kg: 85.6 },
    ]);
  });

  it('saves to the device and reads it back', () => {
    const log = TestBed.inject(WeightLog);
    log.log('2026-10-13', 85.9);
    log.setTarget(80);
    TestBed.tick();

    expect(parseSavedWeight(localStorage.getItem(WEIGHT_STORAGE_KEY))).toEqual({
      entries: [{ date: '2026-10-13', kg: 85.9 }],
      target: 80,
    });
  });

  it('deletes a weigh-in', () => {
    const log = TestBed.inject(WeightLog);
    log.log('2026-10-12', 86);
    log.log('2026-10-13', 85.9);
    log.remove('2026-10-12');

    expect(log.entries()).toEqual([{ date: '2026-10-13', kg: 85.9 }]);
  });

  it('drops malformed saved data instead of the whole log', () => {
    const saved = JSON.stringify({
      entries: [
        { date: '2026-10-13', kg: 85.9 },
        { date: '13/10/2026', kg: 85 },
        { date: '2026-10-12', kg: 'heavy' },
        { date: '2026-10-11', kg: 5 },
      ],
      target: 1000,
    });

    expect(parseSavedWeight(saved)).toEqual({
      entries: [{ date: '2026-10-13', kg: 85.9 }],
      target: null,
    });
    expect(parseSavedWeight('not json')).toEqual({ entries: [], target: null });
  });

  it('puts gridlines on round kg values that cover the weights and the target', () => {
    expect(kgAxis([85.9, 88.6, 80])).toEqual({
      min: 78,
      max: 90,
      ticks: [78, 80, 82, 84, 86, 88, 90],
    });
    expect(kgAxis([85.9])).toEqual({ min: 85, max: 87, ticks: [85, 86, 87] });
  });
});
