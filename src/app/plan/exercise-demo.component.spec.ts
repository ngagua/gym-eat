import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ExerciseDemo } from './exercise-demo.component';
import { EXERCISE_API } from './plan.model';

describe('ExerciseDemo', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(ExerciseDemo);
    fixture.componentRef.setInput('exerciseId', 'EIeI8Vf');
    // Not whenStable(): it would wait on the request this test has yet to answer.
    TestBed.tick();
    const request = TestBed.inject(HttpTestingController).expectOne(`${EXERCISE_API}EIeI8Vf`);
    return { fixture, request, el: fixture.nativeElement as HTMLElement };
  }

  it('shows the GIF the API returns', async () => {
    const { fixture, request, el } = await render();
    request.flush({ data: { name: 'barbell bench press', gifUrl: 'https://cdn.test/bench.gif' } });
    await fixture.whenStable();
    expect(el.querySelector('img')?.getAttribute('src')).toBe('https://cdn.test/bench.gif');
  });

  it('offers a retry when the API fails', async () => {
    const { fixture, request, el } = await render();
    request.flush('Worker exceeded resource limits', { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();
    expect(el.textContent).toContain("Couldn't load the demo.");
    expect(el.querySelector('button')?.textContent?.trim()).toBe('Try again');
  });
});
