import { httpResource } from '@angular/common/http';
import { Component, input } from '@angular/core';
import { EXERCISE_API, ExerciseDbResponse } from './plan.model';

/**
 * An exercise's animated demo from ExerciseDB. Their free tier rotates media links and forbids
 * storing them, so the GIF link is fetched each time the demo is shown.
 */
@Component({
  selector: 'app-exercise-demo',
  template: `
    @if (exercise.hasValue()) {
      <img
        [src]="exercise.value().data.gifUrl"
        width="180"
        height="180"
        [alt]="exercise.value().data.name + ' demonstration'"
        class="mx-auto aspect-square w-full max-w-60 rounded-2xl bg-white"
      />
    } @else if (exercise.error()) {
      <p class="py-4 text-center text-sm text-muted">
        Couldn't load the demo.
        <button
          type="button"
          class="font-semibold text-ink underline underline-offset-4"
          (click)="exercise.reload()"
        >
          Try again
        </button>
      </p>
    } @else {
      <div class="mx-auto aspect-square w-full max-w-60 animate-pulse rounded-2xl bg-line"></div>
    }
  `,
})
export class ExerciseDemo {
  readonly exerciseId = input.required<string>();

  protected readonly exercise = httpResource<ExerciseDbResponse>(
    () => EXERCISE_API + this.exerciseId(),
  );
}
