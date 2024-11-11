import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SimulationComponent } from './pages/simulation/simulation.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(mod => mod.HomeComponent),
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
