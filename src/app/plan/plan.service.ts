import { Service, signal } from '@angular/core';
import { WEEK_PLAN } from './plan.model';

@Service()
export class Plan {
  /** Hardcoded for now; with a backend this becomes httpResource(() => '/api/week'). */
  readonly week = signal(WEEK_PLAN).asReadonly();
}
