import { Component, OnInit, SimpleChange, ViewChild } from '@angular/core';
import { Post } from '../model/Post';
import { PostService } from '../service/post.service';
import { ForumService } from '../service/forum.service';
import { UserService } from '../service/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ForumFormModalComponent } from '../forum-form-modal/forum-form-modal.component';
import { Forum } from '../model/Forum';
import { User } from '../model/User';
import { PostFormModalComponent } from '../post-form-modal/post-form-modal.component';
import { AuthenticationService } from '../service/authentication.service';
import { CredentialsFormModalComponent } from '../credentials-form-modal/credentials-form-modal.component';
import { SynchronizeService } from '../service/synchronize.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  showTux: boolean;

  currentPage: number;
  isLoading: boolean;
  hasMorePosts: boolean;

  @ViewChild('postForm') postForm: PostFormModalComponent;
  @ViewChild('profileForm') profileForm: ForumFormModalComponent;
  @ViewChild('credentialsForm') credentialsForm: CredentialsFormModalComponent;

  loggedUserId: number;
  objectProfiled: any;
  posts: Post[];

  forumSubscription: Subscription;
  userSubscription: Subscription;
  banSubscription: Subscription;

  showUsers: boolean;
  postAction: string;
  postToReply: Post;
  postToEdit: Post;
  content: string;
  showInfo: Boolean;

  constructor(private route: ActivatedRoute, private router: Router, private postService: PostService,
    private forumService: ForumService, private userService: UserService, private authService: AuthenticationService, private shyncService: SynchronizeService) {

    this.forumSubscription = this.shyncService.forum$.subscribe(data => {
      if (data.object && data.object.id == this.objectProfiled.id) {
        if (data.action == "follow")
          this.objectProfiled.followed = true;
        else if (data.action == "unfollow") {
          this.objectProfiled.admin = false;
          this.objectProfiled.followed = false;
          this.loadForumPosts(this.objectProfiled.id);
        }
      }
    })

    this.userSubscription = this.shyncService.user$.subscribe(data => {
      if (data.object.id == this.objectProfiled.id) {
        if (data.action == "follow")
          this.objectProfiled.followed = true;
        else if (data.action == "unfollow")
          this.objectProfiled.followed = false;
      }
    })

    this.banSubscription = this.shyncService.ban$.subscribe(userId => {
      this.posts = this.posts.filter(p => p.authorId != userId);
    })

  }

  ngOnInit(): void {

    this.authService.loggedUserId$.subscribe(loggedUserId => {
      this.loggedUserId = loggedUserId!;
    });
    this.showUsers = this.shyncService.showUsers;
    this.route.paramMap.subscribe(params => {
      this.showTux = false;
      this.content = this.route.snapshot.url[0].path;
      const id = parseInt(params.get('id')!);
      if (this.content == "forum") {
        this.resetPagination();
        this.loadSelectedForum(id);
        this.loadForumPosts(id);
      } else if (this.content == "user") {
        this.resetPagination();
        this.loadSelectedUser(id);
        this.loadUserPosts(id);
      }
    });
  }

  resetPagination() {
    this.currentPage = 0;
    this.isLoading = false;
    this.hasMorePosts = true;
    this.posts = [];
  }

  back() {
    history.back();
  }

  toggleInfo() {
    this.showInfo = !this.showInfo;
  }

  toggleUsers() {
    this.showUsers = !this.showUsers;
    this.shyncService.showUsers = this.showUsers;
  }

  loadSelectedForum(forumId: number) {
    this.forumService.getForumById(forumId).subscribe(
      forum => this.objectProfiled = forum,
      error => {
        console.log(error);
        this.router.navigate(['forumNotFound']);
      }
    )
  }

  loadForumPosts(forumId: number) {
    if (!this.isLoading && this.hasMorePosts) {
      this.isLoading = true;
      this.postService.getForumPostsByForumId(forumId, this.currentPage).subscribe(
        page => {
          this.posts = [...this.posts, ...page.content];
          this.hasMorePosts = !page.last;
          this.currentPage = page.number + 1;
          this.isLoading = false;
          this.showTux = true;
        },
        error => {
          this.showTux = true;
          console.log(error);
          this.isLoading = false;
        }
      )
    }
  }

  loadSelectedUser(userId: number) {
    this.userService.getUserById(userId).subscribe(
      user => this.objectProfiled = user,
      error => {
        console.log(error);
        this.router.navigate(['userNotFound']);
      }
    )
  }

  loadUserPosts(userId: number) {
    if (!this.isLoading && this.hasMorePosts) {
      this.isLoading = true;
      this.postService.getUserPostsByUserId(userId, this.currentPage).subscribe(
        page => {
          this.posts = [...this.posts, ...page.content];
          this.hasMorePosts = !page.last;
          this.currentPage = page.number + 1;
          this.isLoading = false;
          this.showTux = true;
        },
        error => {
          this.showTux = true;
          console.log(error);
          this.isLoading = false;
        }
      )
    }
  }

  onScroll(event: any): void {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      this.content == "forum" ? this.loadForumPosts(this.objectProfiled.id) : this.loadUserPosts(this.objectProfiled.id);
    }
  }

  followForum(forumId: number) {
    this.forumService.forumInteraction("follow", forumId).subscribe(
      message => {
        console.log(message);
        this.objectProfiled.followed = true;
        this.shyncService.forumSync({ "object": this.objectProfiled, "action": "follow" });
      },
      error => console.log(error)
    )
  }

  unfollowForum(forumId: number) {
    this.forumService.forumInteraction("unfollow", forumId).subscribe(
      message => {
        console.log(message);
        this.objectProfiled.followed = false;
        this.objectProfiled.admin = false;
        this.shyncService.forumSync({ "object": this.objectProfiled, "action": "unfollow" });
      },
      error => console.log(error)
    )
  }

  followUser(userId: number) {
    this.userService.followInteraction("follow", userId).subscribe(
      message => {
        console.log(message);
        this.objectProfiled.followed = true
        this.shyncService.userSync({ "object": this.objectProfiled, "action": "follow" });
      },
      error => console.log(error)
    )
  }

  unfollowUser(userId: number) {
    this.userService.followInteraction("unfollow", userId).subscribe(
      message => {
        console.log(message);
        this.objectProfiled.followed = false
        this.shyncService.userSync({ "object": this.objectProfiled, "action": "unfollow" });
      },
      error => console.log(error)
    )
  }

  likesInteraction(postIndex: number, postId: number) {
    let action: string;
    if (this.posts[postIndex].liked)
      action = "UNLIKE"
    else
      action = "LIKE"
    this.postService.postInteraction(postId, action).subscribe(
      post => {
        this.posts[postIndex] = post
        console.log(action + " post con id " + postId + " realizado con éxito.");
      },
      error => console.log(error.message)
    )
  }

  savesInteraction(postIndex: number, postId: number) {
    let action: string;
    if (this.posts[postIndex].saved)
      action = "UNSAVE"
    else
      action = "SAVE"
    this.postService.postInteraction(postId, action).subscribe(
      post => {
        this.posts[postIndex] = post
        console.log(action + " post con id " + postId + " realizado con éxito.");
      },
      error => console.log(error)
    )
  }

  banUser(forumId: number, userId: number) {
    this.forumService.forumBanInteraction("ban", forumId, userId).subscribe(
      message => {
        console.log(message);
        if (this.content == "forum")
          this.shyncService.banSync(userId);
        else
          this.posts = this.posts.filter(p => p.forumId != forumId);
      },
      error => console.log(error)
    )
  }

  openForumForm() {
    this.profileForm.openForm();
  }

  publicateForm() {
    this.postForm.forumId = this.objectProfiled.id;
    this.postForm.openForm();
  }

  replyForm(repliedPost: Post) {
    this.postForm.repliedPost = repliedPost;
    this.postForm.openForm();
  }

  editForm(postToEdit: Post) {
    this.postForm.post = postToEdit;
    this.postForm.openForm();
  }

  updateCredentials() {
    this.credentialsForm.openForm();
  }

  updateForum(forum: Forum) {
    this.objectProfiled.title = forum.title;
    this.objectProfiled.status = forum.status;
    this.objectProfiled.description = forum.description;
    this.objectProfiled.rules = forum.rules;
    this.resetPagination();
    this.loadForumPosts(this.objectProfiled.id);
    this.shyncService.forumSync({ "object": this.objectProfiled });

  }

  updateUser(user: User) {
    this.objectProfiled.nick = user.nick;
    this.objectProfiled.status = user.status;
    this.objectProfiled.biography = user.biography;
    this.resetPagination();
    this.loadUserPosts(this.objectProfiled.id);
  }

  updatePost(postAction: { post: Post, action: string }) {
    if (postAction.action == "edit") {
      let postIndex = this.posts.findIndex(post => post.postId == postAction.post.postId);
      this.posts[postIndex] = postAction.post;
    } else if (postAction.action == "publicate")
      this.posts.unshift(postAction.post);
    else if (postAction.action == "reply")
      this.goThread(postAction.post.repliedPostId);
  }

  deletePost(postIndex: number, postId: number) {
    this.postService.deletePostById(postId).subscribe(
      message => {
        console.log(message);
        this.posts.splice(postIndex, 1);
      },
      error => console.log(error)
    )
  }

  goForumPage(forumId: number) {
    this.router.navigate([`/forum/${forumId}`]);
  }

  goUserPage(forumId: number) {
    this.router.navigate([`/user/${forumId}`]);
  }

  goThread(postId: number) {
    this.router.navigate([`/thread/${postId}`]);
  }

  goSavedsPage() {
    this.router.navigate(['saveds']);
  }

  goHome() {
    this.router.navigate(['']);
  }

}