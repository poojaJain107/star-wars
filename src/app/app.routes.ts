import { Routes } from '@angular/router';
import { CharacterListComponent } from './components/character-list/character-list.component';
import { CharacterDetailComponent } from './components/character-detail/character-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/characters', pathMatch: 'full' },
  { 
    path: 'characters', 
    loadComponent: () => import('./components/character-list/character-list.component').then(m => m.CharacterListComponent)
  },
  { 
    path: 'characters/:id', 
    loadComponent: () => import('./components/character-detail/character-detail.component').then(m => m.CharacterDetailComponent)
  },
  { path: '**', redirectTo: '/characters' }
];
