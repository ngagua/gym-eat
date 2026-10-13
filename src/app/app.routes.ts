import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'today' },
  {
    path: 'today',
    title: 'Today · GymEat',
    loadComponent: () => import('./plan/day.component').then((m) => m.Day),
  },
  {
    path: 'week',
    title: 'Week · GymEat',
    loadComponent: () => import('./plan/week.component').then((m) => m.Week),
  },
  {
    path: 'weight',
    title: 'Weight · GymEat',
    loadComponent: () => import('./weight/weight.component').then((m) => m.Weight),
  },
  {
    path: 'week/:day',
    title: 'Week · GymEat',
    loadComponent: () => import('./plan/day.component').then((m) => m.Day),
  },
  { path: '**', redirectTo: 'today' },
];
