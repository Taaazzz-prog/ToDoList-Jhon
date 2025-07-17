import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { CategoryManagerComponent } from './components/category-manager/category-manager.component';
import { AuthGuard } from './guards/auth.guard';

console.log('🛣️ app.routes.ts: Configuration des routes avec LoginComponent, TaskListComponent, UserProfileComponent et CategoryManagerComponent');

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'tasks', 
    component: TaskListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile', 
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'categories', 
    component: CategoryManagerComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/tasks' }
];

console.log('✅ app.routes.ts: Routes complètes configurées =', routes);
