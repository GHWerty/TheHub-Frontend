import { Component, ViewChild } from '@angular/core';
import { PostFormModalComponent } from '../post-form-modal/post-form-modal.component';
import { Post } from '../model/Post';
import { PostService } from '../service/post.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { ForumService } from '../service/forum.service';

@Component({
  selector: 'app-saveds',
  templateUrl: './saveds.component.html',
  styleUrl: './saveds.component.css'
})
export class SavedsComponent {

  showTux: boolean;

  currentPage: number;
  isLoading: boolean;
  hasMorePosts: boolean;

  @ViewChild('postForm') postForm: PostFormModalComponent;
  posts: Post[];
  loggedUserId: number;

  constructor(private postService: PostService, private router: Router, private forumService: ForumService, private authService: AuthenticationService) { }

  ngOnInit(): void {

    this.resetPagination();
    this.loadSavedPosts();

    this.authService.loggedUserId$.subscribe(loggedUserId => {
      this.loggedUserId = loggedUserId!;
    });
  }

  back() {
    history.back();
  }

  replyForm(repliedPost: Post) {
    this.postForm.repliedPost = repliedPost;
    this.postForm.openForm();
  }

  editForm(postToEdit: Post) {
    this.postForm.post = postToEdit;
    this.postForm.openForm();
  }

  resetPagination() {
    this.currentPage = 0;
    this.isLoading = false;
    this.hasMorePosts = true;
    this.posts = [];
  }

  loadSavedPosts() {
    if (!this.isLoading && this.hasMorePosts) {
      this.isLoading = true;
      this.postService.getSavedPosts(this.currentPage).subscribe(
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
      this.loadSavedPosts();
    }
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
    this.postService.postInteraction(postId, "UNSAVE").subscribe(
      post => {
        console.log("El post '" + post.title + "' ya no aparecerá en guardados");
        this.posts.splice(postIndex, 1)
      },
      error => console.log(error)
    )
  }

  updatePost(postAction: { post: Post, repliedPostId?: number, action: string }) {
    if (postAction.action == "reply") {
      this.goThread(postAction.post.repliedPostId);
    }
    else if (postAction.action == "edit") {
      let postIndex = this.posts.findIndex(post => post.postId == postAction.post.postId);
      this.posts[postIndex] = postAction.post;
    }
  }

  deletePost(postIndex: number, post: Post) {
    this.postService.deletePostById(post.postId).subscribe(
      message => {
        console.log(message)
        if (post.replied) {
          this.resetPagination();
          this.loadSavedPosts();
        }
        else
          this.posts.splice(postIndex, 1);
      },
      error => console.log(error)
    )
  }

  banUser(forumId: number, userId: number) {
    this.forumService.forumBanInteraction("ban", forumId, userId).subscribe(
      message => {
        console.log(message);
        this.resetPagination();
        this.loadSavedPosts();
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

  goHome() {
    this.router.navigate(['']);
  }

}
