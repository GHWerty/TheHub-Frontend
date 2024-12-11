import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService {

  loggedUserId: number;
  private isRefreshing = false;
  private refreshSession: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthenticationService) {
    this.authService.loggedUserId$.subscribe(loggedUserId => {
      this.loggedUserId = loggedUserId!;
    });
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const modifiedRequest = request.clone({ withCredentials: true });
    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const modifiedRequest = request.clone({ withCredentials: true });
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSession.next(null);
      // Siempre va a contener un valor o el guard lo expulsa
      return this.authService.refreshSession(this.loggedUserId).pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshSession.next(true);
          return next.handle(modifiedRequest);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          return throwError(err);
        })
      );
    } else {
      return this.refreshSession.pipe(
        filter(result => result === true),
        take(1),
        switchMap(() => {
          return next.handle(modifiedRequest);
        })
      );
    }
  }

}
