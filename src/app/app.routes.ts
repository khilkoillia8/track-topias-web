import {Routes} from '@angular/router';
import {HabitInstancesPageComponent} from "./pages/habit-instances-page/habit-instances-page.component";
import {StartPageComponent} from "./pages/start/start-page/start-page.component";
import {HomePageComponent} from './pages/home-page/home-page.component';
import {RankingPageComponent} from './pages/ranking-page/ranking-page.component';
import {SocialPageComponent} from './pages/social-page/social-page.component';
import {TasksPageComponent} from './pages/tasks-page/tasks-page.component';
import {authGuard} from "./shared/auth/auth.guard";
import {LoginComponent} from "./shared/auth/components/login/login.component";
import {RegisterComponent} from "./shared/auth/components/register/register.component";
import {unAuthGuard} from "./shared/auth/unauth.guard";

export const routes: Routes = [
  {path: 'start', component: StartPageComponent, canActivate: [unAuthGuard]},
  {path: 'login', component: LoginComponent, canActivate: [unAuthGuard]},
  {path: 'register', component: RegisterComponent, canActivate: [unAuthGuard]},
  {path: 'home', component: HomePageComponent, canActivate: [authGuard]},
  {path: 'ranking', component: RankingPageComponent, canActivate: [authGuard]},
  {path: 'social', component: SocialPageComponent, canActivate: [authGuard]},
  {path: 'task', component: TasksPageComponent, canActivate: [authGuard]},
  {path: 'habit-instances', component: HabitInstancesPageComponent, canActivate: [authGuard]},
  {
    path: '',
    component: HomePageComponent,
    canActivate: [authGuard]
  },
  {path: '**', redirectTo: 'home'},
];
