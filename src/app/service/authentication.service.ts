import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private urlEndPoint: string = 'http://localhost:8081';
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  private loggedUserIdSubject: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  public loggedUserId$: Observable<number | null> = this.loggedUserIdSubject.asObservable();

  constructor(private http: HttpClient) {
    let userId:number = parseInt(localStorage.getItem('userId')!);
    if ( userId != null){
      this.loggedUserIdSubject.next(userId);
    }
  }

  login(email: string, password: string): Observable<string> {
    return this.http.post<number>(`${this.urlEndPoint}/login`, { "email": email, "password": password }, { headers: this.httpHeaders }).pipe(
      map((response: any) => {
        localStorage.setItem('userId', response.result);
        this.loggedUserIdSubject.next(response.result)
        return "usuario logeado con éxito";
      }),
      catchError(error => throwError(error)))
  }

  register(nick: string,email:string, password: string){
    return this.http.post<number>(`${this.urlEndPoint}/register`, { "nick": nick, "email":email, "password": password }, { headers: this.httpHeaders }).pipe(
      map((response: any) => {
        localStorage.setItem('userId', response.result);
        this.loggedUserIdSubject.next(response.result)
        return "usuario creado con éxito";
      }),
      catchError(error => throwError(error)))
  }

  logOut(){
    localStorage.removeItem('userId');
    this.loggedUserIdSubject.next(null);
  }

  refreshSession(loggedUserId: number): Observable<number> {
    return this.http.post<string>(`${this.urlEndPoint}/refreshSession`, loggedUserId, { headers: this.httpHeaders }).pipe(
      map((response:any) => response.result as number)
    );
  }
}