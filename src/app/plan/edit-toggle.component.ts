import { Component, inject } from '@angular/core';
import { Plan } from './plan.service';

/** Switches the Week and day pages between viewing and editing the plan. */
@Component({
  selector: 'app-edit-toggle',
  template: `
    <button
      type="button"
      class="rounded-full border-2 border-ink px-5 py-2 font-semibold transition-colors"
      [class.bg-ink]="plan.editing()"
      [class.text-bg]="plan.editing()"
      (click)="plan.editing.update((editing) => !editing)"
    >
      {{ plan.editing() ? 'Done' : 'Edit plan' }}
    </button>
  `,
})
export class EditToggle {
  protected readonly plan = inject(Plan);
}
