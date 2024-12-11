import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { User } from '../model/User';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { Forum } from '../model/Forum';
import { Post } from '../model/Post';
import { ForumService } from '../service/forum.service';
import { AuthenticationService } from '../service/authentication.service';
import { SynchronizeService } from '../service/synchronize.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  currentPage: number;
  isLoading: boolean;
  hasMoreContent: boolean;

  users: User[];
  loggedUserId: number;
  userSubscription: Subscription;
  banSubscription: Subscription;
  bannedList: boolean;

  @ViewChild('searchUser') searchUserInput: ElementRef;
  @Input() forum: Forum;
  @Input() thread: Post;

  constructor(private userService: UserService, private router: Router, private forumService: ForumService,
    private authService: AuthenticationService, private shyncService: SynchronizeService) {

    this.userSubscription = this.shyncService.user$.subscribe(data => {
      let userIndex = this.users.findIndex(user => user.id == data.object.id);
      if (userIndex != -1) {
        if (data.action == "follow")
          this.users[userIndex].followed = true;
        else if (data.action == "unfollow")
          this.users[userIndex].followed = false;

      }
    })

    this.banSubscription = this.shyncService.ban$.subscribe(userId => {
      if (!this.bannedList) {
        let index = this.users.findIndex(user => user.id == userId);
        if (index != -1)
          this.users.splice(index, 1);
      } else
        this.userService.getUserById(userId).subscribe(user => this.users.unshift(user));
    })
  }

  ngOnInit(): void {
    this.authService.loggedUserId$.subscribe(loggedUserId => {
      this.loggedUserId = loggedUserId!;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.resetPagination();
    if (changes['forum'] && this.forum) {
      this.loadForumUsers(this.forum.id);
    }
    if (changes['thread'] && this.thread) {
      this.loadForum(this.thread.forumId);
      this.loadThreadUsers(this.thread.postId);
    }
    this.bannedList = false;
  }

  showBanedList() {
    this.bannedList = !this.bannedList;
    this.resetPagination();
    if (this.bannedList)
      this.loadBannedUsers();
    else if (this.thread) {
      if (!this.forum)
        this.loadForum(this.thread.forumId);
      this.loadThreadUsers(this.thread.postId);
    } else if (this.forum)
      this.loadForumUsers(this.forum.id);
    this.searchUserInput.nativeElement.value = "";
  }

  resetPagination() {
    this.currentPage = 0;
    this.isLoading = false;
    this.hasMoreContent = true;
    this.users = [];
  }

  onScroll(event: any): void {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      this.loadingTypeDetect();
    }
  }

  onTextInput(): void {
    this.resetPagination();
    this.loadingTypeDetect();
  }

  loadingTypeDetect() {
    const inputValue = this.searchUserInput.nativeElement.value;
    if (inputValue != "") {
      if (!this.bannedList) {
        if (this.forum)
          this.loadForumUsersByNick(this.forum.id, inputValue);
        else if (this.thread)
          this.loadThreadUsersByNick(this.thread.postId, inputValue);
      } else
        this.loadBannedUsersByNick(inputValue);
    } else {
      if (!this.bannedList) {
        if (this.forum)
          this.loadForumUsers(this.forum.id);
        else if (this.thread)
          this.loadThreadUsers(this.thread.postId);
      } else
        this.loadBannedUsers();
    }
  }

  loadBannedUsers() {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.userService.getBannedUsersByForumId(this.forum.id, this.currentPage).subscribe(
        page => {
          this.users = [...this.users, ...page.content];
          this.hasMoreContent = !page.last;
          this.currentPage = page.number + 1;
          this.isLoading = false;
        },
        error => {
          console.log(error);
          this.isLoading = false;
        }
      )
    }
  }

  loadBannedUsersByNick(nick: string) {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.userService.getBannedUsersByForumIdAndNick(this.forum.id, nick, this.currentPage).subscribe(
        page => {
          this.users = [...this.users, ...page.content];
          this.hasMoreContent = !page.last;
          this.currentPage = page.number + 1;
          this.isLoading = false;
        },
        error => {
          console.log(error);
          this.isLoading = false;
        }
      )
    }
  }

  loadForum(forumId: number) {
    this.forumService.getForumById(forumId).subscribe(
      forum => this.forum = forum,
      error => console.log(error)
    )
  }

  loadForumUsersByNick(forumId: number, nick: string) {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.userService.getUsersByForumIdAndNick(forumId, nick, this.currentPage).subscribe(
        page => {
          this.users = [...this.users, ...page.content];
          this.hasMoreContent = !page.last;
          this.currentPage = page.number + 1;
          this.isLoading = false;
        },
        error => {
          console.log(error);
          this.isLoading = false;
        }
      )
    }
  }

  loadForumUsers(forumId: number) {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.userService.getUsersByForumId(forumId, this.currentPage).subscribe(
        page => {
          this.users = [...this.users, ...page.content];
          this.hasMoreContent = !page.last;
          this.currentPage = page.number + 1;
          this.isLoading = false;
        },
        error => {
          console.log(error);
          this.isLoading = false;
        }
      )
    }
  }

  grantAdmin(userIndex: number, userId: number, admin: boolean) {
    this.forumService.grantAdminRole(this.forum.id, userId, admin).subscribe(
      result => {
        console.log(result);
        this.users[userIndex].admin = admin;
      },
      error => console.log(error.error.message)
    )
  }

  //KSJGHFLSDFKJGHSDLGKJDF
  banUser(userId: number) {
    this.forumService.forumBanInteraction("ban", this.forum.id, userId).subscribe(
      message => {
        console.log(message);
        this.shyncService.banSync(userId);
      },
      error => console.log(this.loggedUserId)
    )
  }

  unbanUser(userId: number, userIndex: number) {
    this.forumService.forumBanInteraction("unban", this.forum.id, userId).subscribe(
      message => {
        console.log(message);
        this.users.splice(userIndex, 1);
      },
      error => console.log(error)
    )
  }

  loadThreadUsersByNick(forumId: number, nick: string) {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.userService.getUsersByPostIdAndNick(forumId, nick, this.currentPage).subscribe(
        page => {
          this.users = [...this.users, ...page.content];
          this.hasMoreContent = !page.last;
          this.currentPage = page.number + 1;
          this.isLoading = false;
        },
        error => {
          console.log(error);
          this.isLoading = false;
        }
      )
    }
  }

  loadThreadUsers(threadId: number) {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.userService.getUsersByPostId(threadId, this.currentPage).subscribe(
        page => {
          this.users = [...this.users, ...page.content];
          this.hasMoreContent = !page.last;
          this.currentPage = page.number + 1;
          this.isLoading = false;
        },
        error => {
          console.log(error);
          this.isLoading = false;
        }
      )
    }
  }

  followUser(userIndex: number, userId: number) {
    this.userService.followInteraction("follow", userId).subscribe(
      message =>{
        console.log(message);
        this.shyncService.userSync({ "object": this.users[userIndex], "action": "follow" })
      },
      error => console.log(error)
    )
  }

  unfollowUser(userIndex: number, userId: number) {
    this.userService.followInteraction("unfollow", userId).subscribe(
      message => {
        console.log(message);
        this.shyncService.userSync({ "object": this.users[userIndex], "action": "unfollow" })
      },
      error => console.log(error)
    )
  }

  goUserPage(userId: number) {
    this.router.navigate([`/user/${userId}`]);
  }

}
