import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app.component';
import { Motion } from './motion/motion.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the Today, Week and Weight tabs', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = [...compiled.querySelectorAll('nav a')].map((a) => a.textContent?.trim());
    expect(tabs).toEqual(['Today', 'Week', 'Weight']);
  });

  it('lets the user pause and replay the animated background', async () => {
    const fixture = TestBed.createComponent(App);
    const motion = TestBed.inject(Motion);
    motion.enabled.set(true);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('header button') as HTMLButtonElement;

    expect(button.getAttribute('aria-label')).toBe('Pause background animation');
    button.click();
    await fixture.whenStable();
    expect(motion.backgroundPaused()).toBe(true);
    expect(localStorage.getItem('gymeat.background-paused')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Play background animation');

    button.click();
    await fixture.whenStable();
    expect(motion.backgroundPaused()).toBe(false);
  });
});
