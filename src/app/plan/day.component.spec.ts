import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Day } from './day.component';
import { DEMO_URL, WEEK_PLAN, weekdayOf } from './plan.model';

describe('Day', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  async function render(day?: string) {
    const fixture = TestBed.createComponent(Day);
    if (day) fixture.componentRef.setInput('day', day);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('maps a date to its weekday', () => {
    expect(weekdayOf(new Date(2026, 9, 12))).toBe('monday');
    expect(weekdayOf(new Date(2026, 9, 18))).toBe('sunday');
  });

  it('shows the day from the URL', async () => {
    const el = await render('wednesday');
    const wednesday = WEEK_PLAN.find((d) => d.day === 'wednesday')!;

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Wednesday');
    expect(el.textContent).toContain(wednesday.focus);
    expect(el.textContent).toContain(wednesday.meals[0].items[0]);
    expect(el.querySelector('summary img')?.getAttribute('src')).toBe(
      `${DEMO_URL}${wednesday.workout!.exercises[0].demo}/0.jpg`,
    );
  });

  it('shows today without a URL day', async () => {
    const el = await render();
    expect(el.querySelector('h1')?.textContent?.trim().toLowerCase()).toBe(weekdayOf(new Date()));
    expect(el.textContent).toContain('Today');
  });

  it('handles an unknown day', async () => {
    const el = await render('funday');
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Unknown day');
  });
});
