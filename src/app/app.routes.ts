import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'departments',
    pathMatch: 'full',
  },
  {
    path: 'departments',
    loadComponent: () =>
      import('./pages/departments/departments').then((m) => m.Departments),
  },
  {
    path: 'departments/:id',
    loadComponent: () =>
      import('./pages/department-details/department-details').then(
        (m) => m.DepartmentDetails
      ),
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./pages/students/students').then((m) => m.Students),
  },
];
