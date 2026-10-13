import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Plan } from './plan.service';
import { Week } from './week.component';

describe('Week', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('swaps two days from the swap bar', async () => {
    TestBed.inject(Plan).editing.set(true);
    const fixture = TestBed.createComponent(Week);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const [from, to] = el.querySelectorAll('select');

    from.value = 'monday';
    from.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect([...to.options].map((o) => o.value)).not.toContain('monday');

    to.value = 'thursday';
    [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Swap')!.click();
    await fixture.whenStable();

    const focus = [...el.querySelectorAll('ol li a p.font-semibold')].map((p) => p.textContent);
    expect(focus[0]).toBe('Recovery / walking');
    expect(focus[3]).toBe('Chest + triceps');
    expect(from.value).toBe('');
  });
});
