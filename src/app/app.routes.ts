import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { AuthGuard } from './guards/auth.guard';

console.log('🛣️ app.routes.ts: Configuration des routes avec LoginComponent et TaskListComponent');

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'tasks', 
    component: TaskListComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/tasks' }
];

console.log('✅ app.routes.ts: Routes complètes configurées =', routes);
