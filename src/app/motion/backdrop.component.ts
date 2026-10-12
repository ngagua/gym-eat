import { Component, computed, input } from '@angular/core';
import { Plate } from '../plan/plan.model';

/** Where each glow sits and how it drifts; glows past the list reuse it from the start. */
const GLOWS = [
  '-top-36 -right-40 size-96 animate-drift-a lg:size-[45rem]',
  'top-[40%] -left-44 size-88 animate-drift-b lg:size-[40rem]',
  '-bottom-48 right-[10%] size-96 animate-drift-c lg:size-[38rem]',
  '-right-36 -bottom-40 size-80 animate-drift-a',
];

/** Chalk motes: position in % of the viewport, size in px, timing in s (negative delays start mid-rise). */
const DUST = [
  { left: 9, bottom: 7, size: 3, delay: -1, duration: 13 },
  { left: 20, bottom: 17, size: 2, delay: -6, duration: 11 },
  { left: 31, bottom: 4, size: 4, delay: -3, duration: 15 },
  { left: 42, bottom: 25, size: 2, delay: -9, duration: 12 },
  { left: 53, bottom: 11, size: 3, delay: -4, duration: 10 },
  { left: 61, bottom: 31, size: 2, delay: -7, duration: 14 },
  { left: 70, bottom: 5, size: 3, delay: -2, duration: 12 },
  { left: 77, bottom: 20, size: 4, delay: -10, duration: 16 },
  { left: 85, bottom: 9, size: 2, delay: -5, duration: 11 },
  { left: 91, bottom: 27, size: 3, delay: -8, duration: 13 },
  { left: 15, bottom: 38, size: 2, delay: -11, duration: 12 },
  { left: 49, bottom: 43, size: 2, delay: -12, duration: 14 },
];

/**
 * The page's motion background, fixed behind its content: glows drifting in the given plate
 * colors, a slow light sweep, rising chalk dust and a fine grain. One plate also tints the top of
 * the page. It all stands still under reduced motion.
 */
@Component({
  selector: 'app-backdrop',
  host: {
    class: 'pointer-events-none fixed inset-0 -z-10 overflow-hidden',
    'aria-hidden': 'true',
    '[attr.data-plate]': 'plates()[0]',
  },
  template: `
    @if (plates().length === 1) {
      <div
        class="absolute inset-0 bg-[radial-gradient(130%_75%_at_50%_0%,color-mix(in_srgb,var(--plate)_14%,var(--color-bg)),var(--color-bg)_72%)]"
      ></div>
    }
    @for (glow of glows(); track $index) {
      <div
        class="absolute rounded-full bg-(--plate) opacity-20 blur-[100px] motion-reduce:animate-none dark:opacity-25"
        [class]="glow.position"
        [attr.data-plate]="glow.plate"
      ></div>
    }
    <div
      class="absolute -top-1/4 left-0 h-[150%] w-44 rotate-20 animate-sweep bg-linear-to-r from-transparent via-white/50 to-transparent motion-reduce:hidden dark:via-white/5"
    ></div>
    @for (mote of dust; track $index) {
      <span
        class="absolute rounded-full bg-ink/35 opacity-0 animate-rise"
        [style.left.%]="mote.left"
        [style.bottom.%]="mote.bottom"
        [style.width.px]="mote.size"
        [style.height.px]="mote.size"
        [style.animation-delay.s]="mote.delay"
        [style.animation-duration.s]="mote.duration"
      ></span>
    }
    <div
      class="absolute inset-0 bg-[radial-gradient(color-mix(in_srgb,var(--color-ink)_5%,transparent)_1px,transparent_1px)] bg-size-[3px_3px]"
    ></div>
  `,
})
export class Backdrop {
  /** One plate for a day; several for the week, one glow each. */
  readonly plates = input.required<Plate[]>();

  protected readonly dust = DUST;
  protected readonly glows = computed(() => {
    const plates = this.plates();
    return Array.from({ length: Math.max(plates.length, 3) }, (_, i) => ({
      plate: plates[i % plates.length],
      position: GLOWS[i % GLOWS.length],
    }));
  });
}
