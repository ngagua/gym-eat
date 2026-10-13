import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ExerciseSearch } from './exercise-search.component';
import { EXERCISE_API, SEARCH_DEBOUNCE_MS } from './plan.model';
import { Plan } from './plan.service';

describe('ExerciseSearch', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  async function typeQuery(text: string) {
    const fixture = TestBed.createComponent(ExerciseSearch);
    fixture.componentRef.setInput('day', 'sunday');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input')!;
    input.value = text;
    input.dispatchEvent(new Event('input'));
    // Real time: the search waits for a pause in typing before it calls the API.
    await new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + 50));
    TestBed.tick();
    return { fixture, el, http: TestBed.inject(HttpTestingController) };
  }

  it('lists matches and adds the picked one with its demo and default sets', async () => {
    const { fixture, el, http } = await typeQuery('  squat ');
    http
      .expectOne(
        (req) => req.url === `${EXERCISE_API}search` && req.params.get('search') === 'squat',
      )
      .flush({
        data: [
          { exerciseId: 'jFtipLl', name: 'smith squat', gifUrl: '' },
          { exerciseId: 'LIlE5Tn', name: 'jump squat', gifUrl: '' },
          { exerciseId: 'TDYiji6', name: 'jump squat', gifUrl: '' },
        ],
      });
    await fixture.whenStable();

    expect(el.querySelector('[role=status]')?.textContent?.trim()).toBe('2 matches');
    const buttons = [...el.querySelectorAll('li button')];
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Add Smith squat',
      'Add Jump squat',
    ]);

    (buttons[1] as HTMLButtonElement).click();
    await fixture.whenStable();
    const sunday = TestBed.inject(Plan)
      .week()
      .find((d) => d.day === 'sunday')!;
    expect(sunday.workout?.exercises).toEqual([
      { name: 'Jump squat', target: '3 × 10', demo: 'LIlE5Tn' },
    ]);
    expect(el.querySelector('input')?.value).toBe('');
  });

  it("doesn't call the API for fewer than 3 letters", async () => {
    const { http } = await typeQuery('sq');
    http.expectNone(() => true);
  });

  it('offers a retry when the API fails', async () => {
    const { fixture, el, http } = await typeQuery('row');
    http
      .expectOne(() => true)
      .flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
    await fixture.whenStable();

    expect(el.querySelector('[role=status]')?.textContent).toContain("Couldn't search.");
    expect(el.textContent).toContain('Try again');
  });
});
