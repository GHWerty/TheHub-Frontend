import { Component, ViewChild } from '@angular/core';
import { UserService } from '../service/user.service';
import { ForumService } from '../service/forum.service';
import { Router } from '@angular/router';
import { Forum } from '../model/Forum';
import { ForumFormModalComponent } from '../forum-form-modal/forum-form-modal.component';
import { AuthenticationService } from '../service/authentication.service';
import { Subscription } from 'rxjs';
import { SynchronizeService } from '../service/synchronize.service';

@Component({
  selector: 'app-thehub',
  templateUrl: './thehub.component.html',
  styleUrl: './thehub.component.css'
})
export class ThehubComponent {

  currentPage: number;
  isLoading: boolean;
  hasMoreContent: boolean;

  @ViewChild('forumForm') forumForm: ForumFormModalComponent;
  loggedUserId: number;
  content: any[];
  isForum: boolean;
  forumSubscription: Subscription;
  userSubscription: Subscription;
  selectedOptionIndex: number;
  userOptions: any[] = [
    {
      name: "Explorar",
      action: () => this.loadForums(),
      filter: (title: string) => this.loadForumsByTitle(title),
      content: "forums"
    },
    {
      name: "Foros seguidos",
      action: () => this.loadFollowedForums(),
      filter: (title: string) => this.loadFollowedForumsByTitle(title),
      content: "forums"
    },
    {
      name: "Mis foros",
      action: () => this.loadCreatedForums(),
      filter: (title: string) => this.loadCreatedForumsByTitle(title),
      content: "forums"
    },
    {
      name: "Usuarios seguidos",
      action: () => this.loadFollowedUsers(),
      filter: (nick: string) => this.loadFollowedUsersByNick(nick),
      content: "users"
    },
    {
      name: "Seguidores",
      action: () => this.loadFollowers(),
      filter: (nick: string) => this.loadFollowersByNick(nick),
      content: "users"
    }
  ]

  constructor(private userService: UserService, private forumService: ForumService, private router: Router, private authService: AuthenticationService, private shyncService: SynchronizeService) {

    this.forumSubscription = this.shyncService.forum$.subscribe(data => {
      let forumIndex = data.object ? this.content.findIndex(forum => forum.id == data.object.id) : -1;
      if (this.selectedOptionIndex == 0 && forumIndex != -1) { //Puede que el foro no se haya cargado debido a la paginación
        if (data.action == "follow")
          this.content[forumIndex].followed = true;
        else if (data.action == "unfollow"){
          this.content[forumIndex].followed = false;
          this.content[forumIndex].admin = false;
        }
          
      }
      else if (this.selectedOptionIndex == 1) {
        if (forumIndex == -1 && data.action == "follow")
          this.content.unshift(data.object);
        else if (forumIndex != -1 && data.action == "unfollow")
          this.content.splice(forumIndex, 1);
      }
    });

    this.userSubscription = this.shyncService.user$.subscribe(data => {
      let userIndex = this.content.findIndex(user => user.id == data.object.id);
      if (this.selectedOptionIndex == 3) {
        if (userIndex == -1 && data.action == "follow")
          this.content.unshift(data.object);
        else if (userIndex != -1 && data.action == "unfollow")
          this.content.splice(userIndex, 1);
      } else if (this.selectedOptionIndex == 4) {
        if (data.action == "follow")
          this.content[userIndex].followed = true;
        else if (data.action == "unfollow")
          this.content[userIndex].followed = false;
      }
    })
  }

  ngOnInit(): void {
    this.authService.loggedUserId$.subscribe(loggedUserId => {
      this.loggedUserId = loggedUserId!;
    });
    this.selectOption(0);
  }

  resetPagination() {
    this.currentPage = 0;
    this.isLoading = false;
    this.hasMoreContent = true;
    this.content = [];
  }

  selectOption(optionIndex: number) {
    this.resetPagination();
    if (this.selectedOptionIndex == optionIndex)
      this.selectedOptionIndex = -1;
    else {
      this.selectedOptionIndex = optionIndex;
      this.userOptions[this.selectedOptionIndex].action();
    }
  }

  onScroll(event: any): void {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      this.userOptions[this.selectedOptionIndex].action();
    }
  }

  showUserPage() {
    this.goUserPage(this.loggedUserId);
  }

  followForum(forumIndex: number, forumId: number) {
    this.forumService.forumInteraction("follow", forumId).subscribe(
      message => {
        console.log(message);
        this.shyncService.forumSync({ "object": this.content[forumIndex], "action": "follow" })
      },
      error => console.log(error)
    )
  }

  unfollowForum(forumIndex: number, forumId: number) {
    this.forumService.forumInteraction("unfollow", forumId).subscribe(
      message => {
        console.log(message);
        this.shyncService.forumSync({ "object": this.content[forumIndex], "action": "unfollow" })
      },
      error => console.log(error)
    )
  }

  followUser(userIndex: number, userId: number) {
    this.userService.followInteraction("follow", userId).subscribe(
      message => {
        console.log(message);
        this.shyncService.userSync({ "object": this.content[userIndex], "action": "follow" })
      },
      error => console.log(error)
    )
  }

  unfollowUser(userIndex: number, userId: number) {
    this.userService.followInteraction("unfollow", userId).subscribe(
      message => {
        console.log(message);
        this.shyncService.userSync({ "object": this.content[userIndex], "action": "unfollow" })
      },
      error => console.log(error)
    )
  }

  loadForumsByTitle(title: string) {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.forumService.getForumsByTitle(title, this.currentPage).subscribe(
        page => {
          this.content = [...this.content, ...page.content];
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

  loadForums() {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.forumService.getForums(this.currentPage).subscribe(
        page => {
          this.content = [...this.content, ...page.content];
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

  loadFollowedForumsByTitle(title: string) {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.forumService.getFollowedForumsByTitle(this.loggedUserId, title, this.currentPage).subscribe(
        page => {
          this.content = [...this.content, ...page.content];
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

  loadFollowedForums() {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.forumService.getFollowedForums(this.loggedUserId, this.currentPage).subscribe(
        page => {
          this.content = [...this.content, ...page.content];
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

  loadCreatedForumsByTitle(title: string) {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.forumService.getCreatedForumsByTitle(this.loggedUserId, title, this.currentPage).subscribe(
        page => {
          this.content = [...this.content, ...page.content];
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

  loadCreatedForums() {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.forumService.getCreatedForums(this.loggedUserId, this.currentPage).subscribe(
        page => {
          this.content = [...this.content, ...page.content];
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

  loadFollowedUsersByNick(nick: string) {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.userService.getFollowedUsersByNick(nick, this.currentPage).subscribe(
        page => {
          this.content = [...this.content, ...page.content];
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

  loadFollowedUsers() {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.userService.getFollowedUsers(this.currentPage).subscribe(
        page => {
          this.content = [...this.content, ...page.content];
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

  loadFollowersByNick(nick: string) {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.userService.getFollowersByNick(nick, this.currentPage).subscribe(
        page => {
          this.content = [...this.content, ...page.content];
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

  loadFollowers() {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.userService.getFollowers(this.currentPage).subscribe(
        page => {
          this.content = [...this.content, ...page.content];
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

  deleteForum(forumIndex: number, forumId: number) {
    this.forumService.deleteForumById(forumId).subscribe(
      message => {
        console.log(message);
        this.content.splice(forumIndex, 1);
        if (this.router.url == "/forum/" + forumId)
          this.router.navigate(['/']);
        else if(this.router.url == "/")
          this.shyncService.forumSync({"forumId": forumId, "action": "delete"});
      },
      error => console.log(error)
    )
  }

  onTextInput(event: Event): void {
    this.resetPagination();
    const inputValue = (event.target as HTMLInputElement).value;
    if (inputValue != "")
      this.userOptions[this.selectedOptionIndex].filter(inputValue);
    else
      this.userOptions[this.selectedOptionIndex].action();
  }


  createForum() {
    this.forumForm.openForm();
  }

  actualizarForos(forum: Forum) {
    this.content.push(forum);
  }

  goForumPage(forumId: number) {
    this.router.navigate([`/forum/${forumId}`]);
  }

  goUserPage(postId: number) {
    this.router.navigate([`/user/${postId}`]);
  }

  logOut() {
    this.authService.logOut();
    this.router.navigate(['/login']);
  }

}