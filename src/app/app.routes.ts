import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SimulationComponent } from './pages/simulation/simulation.component';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(mod => mod.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(mod => mod.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'simulacao',
    loadComponent: () => import('./pages/simulation/simulation.component').then(mod => mod.SimulationComponent),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
