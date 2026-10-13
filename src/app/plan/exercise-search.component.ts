import { httpResource } from '@angular/common/http';
import { Component, computed, debounced, inject, input, signal } from '@angular/core';
import { Announcer } from '../announcer.service';
import {
  DEFAULT_TARGET,
  EXERCISE_API,
  ExerciseMatch,
  ExerciseSearchResponse,
  MIN_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_MS,
  toMatches,
  Weekday,
} from './plan.model';
import { Plan } from './plan.service';

/** Finds an exercise among ExerciseDB's 1,500 by name and adds it to the day's workout. */
@Component({
  selector: 'app-exercise-search',
  host: { class: 'grid gap-3' },
  template: `
    <label class="grid gap-1.5 text-sm font-semibold">
      Search all exercises
      <input
        #search
        type="search"
        class="field"
        autocomplete="off"
        aria-describedby="exercise-search-hint"
        [value]="query()"
        (input)="query.set(search.value)"
      />
    </label>
    <p id="exercise-search-hint" class="-mt-1 text-sm text-muted">
      Type at least {{ minLength }} letters, e.g. “bench press”. Needs an internet connection.
    </p>

    <p role="status" class="text-sm font-semibold">{{ status() }}</p>
    @if (results.error()) {
      <button
        type="button"
        class="justify-self-start rounded-full border-2 border-ink px-4 py-1.5 text-sm font-semibold"
        (click)="results.reload()"
      >
        Try again
      </button>
    }

    @if (matches().length && !searching()) {
      <ul class="divide-y divide-line">
        @for (match of matches(); track match.id) {
          <li class="flex items-center gap-3 py-2">
            <span class="flex-1">{{ match.name }}</span>
            <button
              type="button"
              class="shrink-0 rounded-full border-2 border-ink px-4 py-1.5 text-sm font-semibold"
              [attr.aria-label]="'Add ' + match.name"
              (click)="add(match, search)"
            >
              Add
            </button>
          </li>
        }
      </ul>
    }
    <p class="text-xs text-muted">
      Search by
      <a href="https://github.com/ExerciseDB/exercisedb-api" class="underline underline-offset-2"
        >ExerciseDB</a
      >
      from <a href="https://ascendapi.com" class="underline underline-offset-2">AscendAPI</a>.
    </p>
  `,
})
export class ExerciseSearch {
  private readonly plan = inject(Plan);
  private readonly announcer = inject(Announcer);

  readonly day = input.required<Weekday>();

  protected readonly minLength = MIN_SEARCH_LENGTH;
  protected readonly query = signal('');
  private readonly term = computed(() => this.query().trim());
  private readonly settledTerm = debounced(this.term, SEARCH_DEBOUNCE_MS);

  protected readonly results = httpResource<ExerciseSearchResponse>(() => {
    const term = this.settledTerm.value();
    return term.length >= MIN_SEARCH_LENGTH
      ? { url: `${EXERCISE_API}search`, params: { search: term } }
      : undefined;
  });

  protected readonly matches = computed(() =>
    this.results.hasValue() ? toMatches(this.results.value().data) : [],
  );
  /** Still typing, or waiting on the API. */
  protected readonly searching = computed(
    () => this.settledTerm.isLoading() || this.results.isLoading(),
  );

  /** Read out by screen readers, so they hear progress and results as the list changes. */
  protected readonly status = computed(() => {
    const term = this.term();
    if (term.length < MIN_SEARCH_LENGTH) return '';
    if (this.searching()) return 'Searching…';
    if (this.results.error()) return "Couldn't search. Check your connection and try again.";
    const count = this.matches().length;
    if (!count) return `No exercises match “${term}”.`;
    return `${count} ${count === 1 ? 'match' : 'matches'}`;
  });

  protected add(match: ExerciseMatch, search: HTMLInputElement): void {
    this.plan.addExercise(this.day(), { name: match.name, target: DEFAULT_TARGET, demo: match.id });
    this.announcer.say(`Added ${match.name}, ${DEFAULT_TARGET}.`);
    this.query.set('');
    search.focus();
  }
}
