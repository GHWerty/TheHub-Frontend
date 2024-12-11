import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../model/User';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Page } from '../model/Page';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private urlEndPoint:string = 'http://localhost:8081/users';
  private httpHeaders = new HttpHeaders({'Content-Type':'application/json'});

  constructor(private http:HttpClient) { }

  // DE MOMENTO PRUEBAS
  getUserById(userId:number):Observable<User>{
    return this.http.get<User>(`${this.urlEndPoint}/${userId}`, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as User),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar la información del usuario, inténtelo de nuevo más tarde"));
    })
    )
  }

  getFollowersByNick(nick:string, page:number):Observable<Page<User>>{
    return this.http.get<any>(`${this.urlEndPoint}/followers/${nick}?page=${page}`, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as Page<User>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los seguidores, inténtelo de nuevo más tarde"));
    })
    )
  }

  getFollowers(page:number):Observable<Page<User>>{
    return this.http.get<any>(`${this.urlEndPoint}/followers?page=${page}`, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as Page<User>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los seguidores, inténtelo de nuevo más tarde"));
    })
    )
  }

  getFollowedUsersByNick(nick:string, page:number):Observable<Page<User>>{
    return this.http.get<any>(`${this.urlEndPoint}/followedUsers/${nick}?page=${page}`, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as Page<User>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los usuarios seguidos, inténtelo de nuevo más tarde"));
    })
    )
  }

  getFollowedUsers(page:number):Observable<Page<User>>{
    return this.http.get<any>(`${this.urlEndPoint}/followedUsers?page=${page}`, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as Page<User>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los usuarios seguidos, inténtelo de nuevo más tarde"));
    })
    )
  }

  getUsersByForumIdAndNick(forumId:number, nick:string, page:number):Observable<Page<User>> {
    return this.http.get<any>(`${this.urlEndPoint}/forum/${forumId}/nick/${nick}?page=${page}`, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as Page<User>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los seguidores del foro, inténtelo de nuevo más tarde"));
    })
    )
  }

  getUsersByForumId(forumId:number, page:number):Observable<Page<User>> {
    return this.http.get<any>(`${this.urlEndPoint}/forum/${forumId}?page=${page}`, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as Page<User>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los seguidores del foro, inténtelo de nuevo más tarde"));
    })
    )
  }

  getBannedUsersByForumIdAndNick(forumId:number, nick:string, page:number):Observable<Page<User>> {
    return this.http.get<any>(`${this.urlEndPoint}/forum/${forumId}/bannedUsers/${nick}?page=${page}`, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as Page<User>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los usuarios baneados del foro, inténtelo de nuevo más tarde"));
    })
    )
  }

  getBannedUsersByForumId(forumId:number, page:number):Observable<Page<User>> {
    return this.http.get<any>(`${this.urlEndPoint}/forum/${forumId}/bannedUsers?page=${page}`, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as Page<User>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los usuarios baneados del foro, inténtelo de nuevo más tarde"));
    })
    )
  }

  getUsersByPostIdAndNick(postId:number, nick:string, page:number):Observable<Page<User>> {
    return this.http.get<any>(`${this.urlEndPoint}/thread/${postId}/nick/${nick}?page=${page}`, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as Page<User>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los participantes del hilo, inténtelo de nuevo más tarde"));
    })
    )
  }

  getUsersByPostId(postId:number, page:number):Observable<Page<User>> {
    return this.http.get<any>(`${this.urlEndPoint}/thread/${postId}?page=${page}`, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as Page<User>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los participantes del hilo, inténtelo de nuevo más tarde"));
    })
    )
  }

  updateUser(user:User):Observable<User> {
    return this.http.put(`${this.urlEndPoint}`, user, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as User),
    )
  }

  updateCredentials(email:string, password:string):Observable<string>{
    return this.http.put(`${this.urlEndPoint}/credentials`, {"email": email, "password": password}, {headers:this.httpHeaders}).pipe(
      map((response:any) => response.result as string)
    )
  }

  followInteraction(action: string, userId: number): Observable<string> {
    return this.http.post<any>(`${this.urlEndPoint}/${action}/${userId}`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as string),
      catchError(error => {
        console.error("Error producido: " + error.error.message);
        return throwError(() => new Error("Error al dar " + action + " al usuario, inténtelo de nuevo más tarde"));
      })
    );
  }

}
