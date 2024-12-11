import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SynchronizeService {

  private forumSubject = new Subject<any>();
  forum$ = this.forumSubject.asObservable();

  
  private userSubject = new Subject<any>();
  user$ = this.userSubject.asObservable();

  private banSubject = new Subject<any>();
  ban$ = this.banSubject.asObservable();

  showUsers:boolean = false;

  forumSync(data:any) {
    this.forumSubject.next(data);
  }

  userSync(data:any) {
    this.userSubject.next(data);
  }

  banSync(data:any) {
    this.banSubject.next(data);
  }
  
}
