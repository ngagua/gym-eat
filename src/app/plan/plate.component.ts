import { afterRenderEffect, Component, computed, ElementRef, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { Motion } from '../motion/motion.service';
import { Meal, total } from './plan.model';

/** The day's meals as a weight plate: one arc per meal, sized by its share of the day's kcal. */
@Component({
  selector: 'app-plate',
  host: { class: 'relative grid place-items-center' },
  template: `
    <svg viewBox="0 0 100 100" class="absolute inset-0 size-full -rotate-90" aria-hidden="true">
      <circle cx="50" cy="50" r="44" fill="none" stroke-width="10" class="stroke-line" />
      @for (arc of arcs(); track $index) {
        <circle
          data-arc
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke-width="10"
          pathLength="100"
          class="stroke-(--plate)"
          [attr.stroke-dasharray]="arc.length + ' 100'"
          [attr.stroke-dashoffset]="-arc.start"
        />
      }
    </svg>
    <div class="relative text-center"><ng-content /></div>
  `,
})
export class Plate {
  readonly meals = input.required<Meal[]>();
  /** Seconds to wait before the arcs sweep in, to stagger plates in a list. */
  readonly delay = input(0);

  protected readonly arcs = computed(() => {
    const meals = this.meals();
    const kcal = total(meals, 'kcal');
    const gap = 1.5;
    let start = 0;
    return meals.map((meal) => {
      const share = (meal.kcal / kcal) * 100;
      const arc = { start: start + gap / 2, length: Math.max(share - gap, 0) };
      start += share;
      return arc;
    });
  });

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(Motion);

    afterRenderEffect((onCleanup) => {
      this.arcs();
      if (!motion.enabled()) return;
      const tween = gsap.from(el.querySelectorAll('[data-arc]'), {
        attr: { 'stroke-dasharray': '0 100' },
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.1,
        delay: this.delay(),
      });
      onCleanup(() => tween.kill());
    });
  }
}
