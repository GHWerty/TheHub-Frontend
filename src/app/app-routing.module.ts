import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { ThreadComponent } from './thread/thread.component';
import { LoginComponent } from './login/login.component';
import { ThehubComponent } from './thehub/thehub.component';
import { HomeComponent } from './home/home.component';
import { AuthGuardService } from './service/auth-guard.service';
import { SavedsComponent } from './saveds/saveds.component';
import { RegisterComponent } from './register/register.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  {
    path: '', component: ThehubComponent, canActivate: [AuthGuardService], children: [
      { path: '', component: HomeComponent },
      { path: 'saveds', component: SavedsComponent },
      { path: 'forum/:id', component: ProfileComponent },
      { path: 'user/:id', component: ProfileComponent },
      { path: 'thread/:id', component: ThreadComponent }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', component: NotFoundComponent }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }