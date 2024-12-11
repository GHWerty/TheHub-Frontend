import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Forum } from '../model/Forum';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Page } from '../model/Page';

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  private urlEndPoint: string = 'http://localhost:8081/forums';
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getForums(page:number): Observable<Page<Forum>> {
    return this.http.get<any>(`${this.urlEndPoint}?page=${page}&sort=interactions,desc`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Page<Forum>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los foros, inténtelo de nuevo más tarde"));
    })
    )
  }

  getForumsByTitle(title:string, page:number): Observable<Page<Forum>> {
    return this.http.get<any>(`${this.urlEndPoint}/title/${title}?page=${page}&sort=interactions,desc`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Page<Forum>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los foros, inténtelo de nuevo más tarde"));
    })
    )
  }

  getFollowedForums(userId:number, page:number):Observable<Page<Forum>> {
    return this.http.get<any>(`${this.urlEndPoint}/followed/${userId}?page=${page}&sort=forum.interactions,desc`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Page<Forum>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los foros, inténtelo de nuevo más tarde"));
    })
    )
  }

  getFollowedForumsByTitle(userId:number, title:string, page:number):Observable<Page<Forum>> {
    return this.http.get<any>(`${this.urlEndPoint}/followed/${userId}/title/${title}?page=${page}&sort=forum.interactions,desc`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Page<Forum>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los foros, inténtelo de nuevo más tarde"));
    })
    )
  }

  getCreatedForumsByTitle(userId:number, title:string, page:number):Observable<Page<Forum>> {
    return this.http.get<any>(`${this.urlEndPoint}/created/${userId}/title/${title}?page=${page}&sort=interactions,desc`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Page<Forum>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los foros, inténtelo de nuevo más tarde"));
    })
    )
  }

  getCreatedForums(userId:number, page:number):Observable<Page<Forum>> {
    return this.http.get<any>(`${this.urlEndPoint}/created/${userId}?page=${page}&sort=interactions,desc`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Page<Forum>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los foros, inténtelo de nuevo más tarde"));
    })
    )
  }

  getForumById(forumId:number): Observable<Forum> {
    return this.http.get<Forum>(`${this.urlEndPoint}/${forumId}`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Forum),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar la información del foro, inténtelo de nuevo más tarde"));
    })
    )
  }

  forumInteraction(action: string, forumId: number): Observable<string> {
    return this.http.post<string>(`${this.urlEndPoint}/${action}/${forumId}`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as string),
      catchError(error => {
        console.error("Error producido: " + error.error.message);
        return throwError(() => new Error("No se pudo dar " + action + " al foro, inténtelo de nuevo más tarde"));
      })
    );
  }

  forumBanInteraction(action: string, forumId: number, userId: number): Observable<string> {
    return this.http.post<string>(`${this.urlEndPoint}/forum/${forumId}/${action}/${userId}`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as string),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("No se pudo banear al usuario, inténtelo de nuevo más tarde"));
    })
    )
  }

  grantAdminRole(forumId:number, userId:number, admin:boolean): Observable<string> {
    return this.http.post<string>(`${this.urlEndPoint}/forum/${forumId}/user/${userId}/admin/${admin}`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as string),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("No se pudo actualizar el rol de administrador del usuario, inténtelo de nuevo más tarde"));
      })
    );
  }


  createForum(forum:Forum): Observable<Forum>{
    return this.http.post<Forum>(`${this.urlEndPoint}`, forum, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Forum),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("No se pudo crear el foro, inténtelo de nuevo más tarde"));
    })
    )
  }

  updateForum(forum:Forum): Observable<Forum>{
    return this.http.put<Forum>(`${this.urlEndPoint}`, forum, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Forum),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("No se pudo actualizar la información del foro, inténtelo de nuevo más tarde"));
    })
    )
  }

  deleteForumById(forumId:number):Observable<string>{
    return this.http.delete<string>(`${this.urlEndPoint}/${forumId}`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as string),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("No se pudo eliminar el foro, inténtelo de nuevo más tarde"));
    })
    )
  }
}