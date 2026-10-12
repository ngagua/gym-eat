import { inject, Service, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/** Lenis smooth scrolling + GSAP ScrollTrigger, off when the user prefers reduced motion. */
@Service()
export class Motion {
  private lenis?: Lenis;
  private readonly pausedKey = 'gymeat.background-paused';
  /** Animations run. Stays false under reduced motion and in unit tests, which never call start(). */
  readonly enabled = signal(false);
  /** The user stopped the chalk-dust background (WCAG 2.2.2 asks for a way to). Kept on this device. */
  readonly backgroundPaused = signal(false);

  constructor() {
    try {
      this.backgroundPaused.set(localStorage.getItem(this.pausedKey) === 'true');
    } catch {
      // Storage is blocked (private mode, site settings), so the background starts out playing.
    }
    inject(Router).events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) return;
      if (!this.lenis) {
        window.scrollTo(0, 0);
        return;
      }
      this.lenis.scrollTo(0, { immediate: true });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }

  /** Called once at startup from an app initializer. */
  start(): void {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    this.enabled.set(true);
    this.lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => this.lenis?.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    // Late font loads and route changes resize the page without a scroll, which would leave reveal
    // triggers at stale positions (and their elements invisible). Recalculate when the body resizes.
    let frame = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    }).observe(document.body);
  }

  toggleBackground(): void {
    this.backgroundPaused.update((paused) => !paused);
    try {
      localStorage.setItem(this.pausedKey, String(this.backgroundPaused()));
    } catch {
      // Storage is blocked, so the choice lasts until the page reloads.
    }
  }
}
