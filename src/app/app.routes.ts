// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/auth/login.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',  // ⚠️ Changé : redirige vers login au lieu de students
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'students',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/students/student-list/student-list.component').then(m => m.StudentListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/students/student-form/student-form.component').then(m => m.StudentFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./pages/students/student-form/student-form.component').then(m => m.StudentFormComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'  // ⚠️ Changé : redirige vers login en cas de route inconnue
  }
];