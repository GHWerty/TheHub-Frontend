import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule, routes } from './app-routing.module';
import { AppComponent } from './app.component';
import { ForumService } from './service/forum.service';
import { PostService } from './service/post.service';
import { UserService } from './service/user.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { ThreadComponent } from './thread/thread.component';
import { UsersComponent } from './users/users.component';
import { ForumFormModalComponent } from './forum-form-modal/forum-form-modal.component';
import { FormsModule } from '@angular/forms';
import { UserFormModalComponent } from './user-form-modal/user-form-modal.component';
import { PostFormModalComponent } from './post-form-modal/post-form-modal.component';
import { LoginComponent } from './login/login.component';
import { ThehubComponent } from './thehub/thehub.component';
import { AuthInterceptorService } from './service/auth-interceptor.service';
import { AuthGuardService } from './service/auth-guard.service';
import { AuthenticationService } from './service/authentication.service';
import { SavedsComponent } from './saveds/saveds.component';
import { RegisterComponent } from './register/register.component';
import { CredentialsFormModalComponent } from './credentials-form-modal/credentials-form-modal.component';
import { NotFoundComponent } from './not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent,
    ThreadComponent,
    UsersComponent,
    ForumFormModalComponent,
    UserFormModalComponent,
    PostFormModalComponent,
    LoginComponent,
    ThehubComponent,
    SavedsComponent,
    RegisterComponent,
    CredentialsFormModalComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    ForumService,
    PostService,
    UserService,
    AuthGuardService,
    AuthenticationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
