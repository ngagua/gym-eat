import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CountUp } from '../motion/count-up.directive';
import { Reveal } from '../motion/reveal.directive';
import { DEMO_URL, total, weekdayOf } from './plan.model';
import { Plan } from './plan.service';
import { Plate } from './plate.component';

@Component({
  imports: [CountUp, NgOptimizedImage, Plate, Reveal, RouterLink, TitleCasePipe],
  template: `
    @if (dayPlan(); as d) {
      <div
        class="grid gap-10 pt-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-16"
        [attr.data-plate]="d.plate"
      >
        <section class="lg:sticky lg:top-8">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 class="font-display text-7xl leading-[0.85] font-black sm:text-8xl">
              {{ d.day | titlecase }}
            </h1>
            @if (d.day === today) {
              <span class="rounded-full bg-ink px-3 py-1 text-sm font-semibold text-bg">Today</span>
            }
          </div>
          <p class="mt-5 flex items-center gap-2.5 text-xl font-semibold">
            <span class="size-3.5 shrink-0 rounded-full bg-(--plate)" aria-hidden="true"></span>
            {{ d.focus }}
          </p>
          @if (d.workout; as w) {
            <p class="mt-1 pl-6 text-muted">Gym at {{ w.time }}</p>
          }
          <app-plate class="mx-auto mt-8 size-60 sm:size-64 lg:mx-0 lg:size-72" [meals]="d.meals">
            <span
              class="block font-display text-6xl leading-none font-black"
              [appCountUp]="kcal()"
              >{{ kcal() }}</span
            >
            <span class="block text-sm text-muted">kcal</span>
            <span class="mt-3 block font-semibold"
              ><span [appCountUp]="protein()">{{ protein() }}</span> g protein</span
            >
          </app-plate>
        </section>

        <div class="grid gap-10">
          <section class="rounded-3xl bg-surface p-5 sm:p-7">
            <h2 class="font-display text-3xl font-extrabold">Workout</h2>
            @if (d.workout; as w) {
              <ol class="mt-3 divide-y divide-line">
                @for (e of w.exercises; track $index) {
                  <li>
                    @if (e.demo; as demo) {
                      <!-- Tap to see the movement: the end photo fades in and out over the start photo. -->
                      <details class="group">
                        <summary
                          class="flex cursor-pointer list-none items-center gap-3 py-3 [&::-webkit-details-marker]:hidden"
                        >
                          <img
                            [ngSrc]="demoUrl + demo + '/0.jpg'"
                            width="850"
                            height="567"
                            alt=""
                            class="h-10 w-15 shrink-0 rounded-lg object-cover"
                          />
                          <span class="flex-1">{{ e.name }}</span>
                          <span class="shrink-0 font-display text-xl font-bold">{{
                            e.target
                          }}</span>
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                            class="size-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                            />
                          </svg>
                        </summary>
                        <div class="mb-4 grid gap-2 motion-reduce:grid-cols-2">
                          <img
                            [ngSrc]="demoUrl + demo + '/0.jpg'"
                            width="850"
                            height="567"
                            [alt]="e.name + ', start and end position'"
                            class="col-start-1 row-start-1 w-full rounded-2xl"
                          />
                          <img
                            [ngSrc]="demoUrl + demo + '/1.jpg'"
                            width="850"
                            height="567"
                            alt=""
                            class="col-start-1 row-start-1 w-full animate-rep rounded-2xl motion-reduce:col-start-2 motion-reduce:animate-none"
                          />
                        </div>
                      </details>
                    } @else {
                      <div class="flex items-baseline justify-between gap-4 py-3">
                        <span>{{ e.name }}</span>
                        <span class="shrink-0 font-display text-xl font-bold">{{ e.target }}</span>
                      </div>
                    }
                  </li>
                }
              </ol>
              <p class="mt-1 text-xs text-muted">
                Photos from
                <a
                  href="https://github.com/yuhonas/free-exercise-db"
                  class="underline underline-offset-2"
                  >free-exercise-db</a
                >, public domain.
              </p>
            } @else {
              <p class="mt-2 text-muted">No gym today.</p>
            }
          </section>

          <section>
            <h2 class="font-display text-3xl font-extrabold">Meals</h2>
            <ol class="mt-4 grid gap-3">
              @for (m of d.meals; track $index) {
                <li
                  class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-3 sm:grid-cols-[5rem_minmax(0,1fr)]"
                  [appReveal]="$index"
                >
                  <time class="pt-3 font-display text-2xl font-bold">{{ m.time }}</time>
                  <div class="rounded-2xl bg-surface p-4">
                    <div class="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h3 class="font-semibold">{{ m.name }}</h3>
                      <p class="text-sm text-muted">{{ m.kcal }} kcal, {{ m.protein }} g protein</p>
                    </div>
                    <!-- The meal's share of the day's kcal: the same arc it takes on the plate. -->
                    <div class="mt-2.5 h-1 rounded-full bg-line" aria-hidden="true">
                      <div
                        class="h-full rounded-full bg-(--plate)"
                        [style.width.%]="(m.kcal / kcal()) * 100"
                      ></div>
                    </div>
                    <ul class="mt-3 text-pretty text-muted">
                      @for (item of m.items; track $index) {
                        <li>{{ item }}</li>
                      }
                    </ul>
                  </div>
                </li>
              }
            </ol>
          </section>
        </div>
      </div>
    } @else {
      <h1 class="pt-2 font-display text-6xl font-black">Unknown day</h1>
      <p class="mt-3 text-muted">
        There's no plan for "{{ day() }}".
        <a routerLink="/week" class="font-semibold text-ink underline underline-offset-4"
          >Back to the week</a
        >
      </p>
    }
  `,
})
export class Day {
  private readonly plan = inject(Plan);

  /** Route param on /week/:day; unset on /today. */
  readonly day = input<string>();

  protected readonly today = weekdayOf(new Date());
  protected readonly dayPlan = computed(() =>
    this.plan.week().find((d) => d.day === (this.day() ?? this.today)),
  );
  protected readonly kcal = computed(() => total(this.dayPlan()?.meals ?? [], 'kcal'));
  protected readonly protein = computed(() => total(this.dayPlan()?.meals ?? [], 'protein'));
  protected readonly demoUrl = DEMO_URL;
}
