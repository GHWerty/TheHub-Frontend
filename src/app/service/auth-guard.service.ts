import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  loggedUserId:number | null;

  constructor(private router: Router, private authService:AuthenticationService) { 
    this.authService.loggedUserId$.subscribe(loggedUserId => {
      this.loggedUserId = loggedUserId;
    });
  }

  canActivate(): boolean {
    let auth:boolean = true;
    if (!this.loggedUserId) {
      this.router.navigate(['/login']);
      auth = false;
    }
    return auth;
  }
}