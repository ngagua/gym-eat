import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Day } from './day.component';
import { WEEK_PLAN, weekdayOf } from './plan.model';
import { Plan } from './plan.service';

describe('Day', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

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
  });

  it('shows today without a URL day', async () => {
    const el = await render();
    expect(el.querySelector('h1')?.textContent?.trim().toLowerCase()).toBe(weekdayOf(new Date()));
    expect(el.textContent).toContain('Today');
  });

  it('removes an exercise in edit mode and keeps focus in the list', async () => {
    const fixture = TestBed.createComponent(Day);
    fixture.componentRef.setInput('day', 'wednesday');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    el.querySelector<HTMLButtonElement>('app-edit-toggle button')!.click();
    await fixture.whenStable();
    el.querySelector<HTMLButtonElement>('[aria-label="Remove Lat pulldown"]')!.click();
    await fixture.whenStable();

    expect(el.querySelector('[aria-label="Remove Lat pulldown"]')).toBeNull();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Remove Seated cable row');
  });

  it('renames the focus in edit mode, and keeps it when the field is emptied', async () => {
    TestBed.inject(Plan).editing.set(true);
    const fixture = TestBed.createComponent(Day);
    fixture.componentRef.setInput('day', 'sunday');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const focus = el.querySelector<HTMLInputElement>('section label input')!;

    focus.value = '  ';
    focus.dispatchEvent(new Event('change'));
    expect(focus.value).toBe('Rest day');

    focus.value = ' Push day ';
    focus.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(
      TestBed.inject(Plan)
        .week()
        .find((d) => d.day === 'sunday')?.focus,
    ).toBe('Push day');
  });

  it('handles an unknown day', async () => {
    const el = await render('funday');
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Unknown day');
  });
});
