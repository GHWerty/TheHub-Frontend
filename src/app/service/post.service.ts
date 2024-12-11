import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Post } from '../model/Post';
import { Page } from '../model/Page';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private urlEndPoint: string = 'http://localhost:8081/posts';
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getProfilePosts(page: number): Observable<Page<Post>> {
    return this.http.get<any>(`${this.urlEndPoint}?page=${page}&sort=postDate,desc`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Page<Post>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los posts, intentelo de nuevo más tarde"));
      })
    )
  }

  getThreadPost(postId: number): Observable<Post> {
    return this.http.get<Post>(`${this.urlEndPoint}/${postId}`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Post),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar el post del hilo, intentelo de nuevo más tarde"));
      })
    )
  }

  getForumPostsByForumId(forumId: number, page: number): Observable<Page<Post>> {
    return this.http.get<any>(`${this.urlEndPoint}/forum/${forumId}?page=${page}&sort=postDate,desc`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Page<Post>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los posts, intentelo de nuevo más tarde"));
      })
    )
  }

  getUserPostsByUserId(forumId: number, page: number): Observable<Page<Post>> {
    return this.http.get<any>(`${this.urlEndPoint}/user/${forumId}?page=${page}&sort=postDate,desc`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Page<Post>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los posts, intentelo de nuevo más tarde"));
      })
    )
  }

  postInteraction(postId: number, action: string): Observable<Post> {
    return this.http.post<string>(`${this.urlEndPoint}/${postId}/${action}`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Post),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("No se pudo realizar la acción " + action 
          + " con el post seleccionado, inténtelo de nuevo más tarde."));
      })
    )
  }

  getPostRepliesByPostId(postId: number, page: number): Observable<Page<Post>> {
    return this.http.get(`${this.urlEndPoint}/replies/${postId}?page=${page}&sort=postDate,desc`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Page<Post>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los posts, intentelo de nuevo más tarde"));
      })
    )
  }

  getSavedPosts(page: number): Observable<Page<Post>> {
    return this.http.get(`${this.urlEndPoint}/saveds?page=${page}&sort=post.postDate,desc`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Page<Post>),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al cargar los posts, intentelo de nuevo más tarde"));
      })
    )
  }

  createPost(forumId: number, title: string, text: string): Observable<Post> {
    return this.http.post<Post>(`${this.urlEndPoint}`, { "forumId": forumId, "title": title, "text": text }, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Post),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al publicar el post, intentelo de nuevo más tarde"));
      })
    )
  }

  createReply(repliedPostId: number, forumId: number, title: string, text: string): Observable<Post> {
    return this.http.post<Post>(`${this.urlEndPoint}/${repliedPostId}`, { "forumId": forumId, "title": title, "text": text }, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Post),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al publicar la respuesta, intentelo de nuevo más tarde"));
      })
    )
  }

  updatePost(postId: number, title: string, text: string): Observable<Post> {
    return this.http.put<Post>(`${this.urlEndPoint}`, { "id": postId, "title": title, "text": text }, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as Post),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al actualizar el post, intentelo de nuevo más tarde"));
      })
    )
  }

  deletePostById(postId: number): Observable<string> {
    return this.http.delete<string>(`${this.urlEndPoint}/${postId}`, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.result as string),
      catchError(error => {
        console.error("Error producido:", error.error.message);
        return throwError(() => new Error("Error al eliminar el post, intentelo de nuevo más tarde"));
      })
    );
  }

}
