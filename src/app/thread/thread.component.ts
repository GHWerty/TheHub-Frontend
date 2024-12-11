import { Component, OnInit, ViewChild } from '@angular/core';
import { Post } from '../model/Post';
import { PostService } from '../service/post.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PostFormModalComponent } from '../post-form-modal/post-form-modal.component';
import { AuthenticationService } from '../service/authentication.service';
import { SynchronizeService } from '../service/synchronize.service';
import { ForumService } from '../service/forum.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.css'
})
export class ThreadComponent implements OnInit {

  currentPage: number;
  isLoading: boolean;
  hasMoreContent: boolean;

  @ViewChild('postForm') postForm: PostFormModalComponent;
  loggedUserId: number;
  banSubscription: Subscription;
  post: Post;
  id: number;
  replies: Post[];
  showUsers: boolean;

  constructor(private postService: PostService, private route: ActivatedRoute, private router: Router,
    private authService: AuthenticationService, private shyncService: SynchronizeService, private forumService: ForumService) {

    this.banSubscription = this.shyncService.ban$.subscribe(userId => {
      if (userId == this.post.authorId)
        this.back();
      this.replies = this.replies.filter(r => r.authorId != userId);
    })

  }

  ngOnInit(): void {
    this.authService.loggedUserId$.subscribe(loggedUserId => {
      this.loggedUserId = loggedUserId!;
    });

    this.showUsers = this.shyncService.showUsers;
    this.route.paramMap.subscribe(params => {
      this.currentPage = 0;
      this.isLoading = false;
      this.hasMoreContent = true;
      this.replies = [];
      this.id = parseInt(params.get('id')!);
      this.loadRepliedPost(this.id);
      this.loadReplies(this.id);
    });
  }

  toggleUsers() {
    this.showUsers = !this.showUsers;
    this.shyncService.showUsers = this.showUsers;
  }

  loadRepliedPost(postId: number) {
    this.postService.getThreadPost(postId).subscribe(
      post => this.post = post,
      error => {
        console.log(error);
        this.router.navigate(['threadNotFound']);
      }
    )
  }

  loadReplies(postId: number) {
    if (!this.isLoading && this.hasMoreContent) {
      this.isLoading = true;
      this.postService.getPostRepliesByPostId(postId, this.currentPage).subscribe(
        page => {
          this.replies = [...this.replies, ...page.content];
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

  onScroll(event: any): void {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      this.loadReplies(this.id);
    }
  }

  likesInteraction(postIndex: number, postId: number) {
    let action: string;
    if (this.replies[postIndex].liked)
      action = "UNLIKE"
    else
      action = "LIKE"
    this.postService.postInteraction(postId, action).subscribe(
      post => this.replies[postIndex] = post,
      error => console.log(error)
    )
  }

  repliedPostLikesInteraction(postId: number) {
    let action: string;
    if (this.post.liked)
      action = "UNLIKE"
    else
      action = "LIKE"
    this.postService.postInteraction(postId, action).subscribe(
      post => this.post = post,
      error => console.log(error)
    )
  }

  savesInteraction(postIndex: number, postId: number) {
    let action: string;
    if (this.replies[postIndex].saved)
      action = "UNSAVE"
    else
      action = "SAVE"
    this.postService.postInteraction(postId, action).subscribe(
      post => this.replies[postIndex] = post,
      error => console.log(error)
    )
  }

  repliedPostSavesInteraction(postId: number) {
    let action: string;
    if (this.post.saved)
      action = "UNSAVE"
    else
      action = "SAVE"
    this.postService.postInteraction(postId, action).subscribe(
      post => this.post = post,
      error => console.log(error)
    )
  }

  replyForm(repliedPost: Post) {
    this.postForm.repliedPost = repliedPost;
    this.postForm.openForm();
  }

  editForm(postToEdit: Post) {
    this.postForm.post = postToEdit;
    this.postForm.openForm();
  }

  updatePost(postAction: { post: Post, action: string }) {
    if (postAction.action == "edit") {
      if (postAction.post.postId == this.post.postId)
        this.post = postAction.post
      else {
        let postIndex = this.replies.findIndex(post => post.postId == postAction.post.postId);
        this.replies[postIndex] = postAction.post;
      }
    } else if (postAction.action == "reply") {
      if (postAction.post.repliedPostId == this.post.postId) {
        this.replies.unshift(postAction.post);
      } else {
        this.goThread(postAction.post.repliedPostId);
      }
    }
  }

  deletePost(postId: number) {
    this.postService.deletePostById(postId).subscribe(
      message => {
        console.log(message);
        history.back();
      },
      error => console.log(error)
    )
  }

  deleteReply(postIndex: number, postId: number) {
    this.postService.deletePostById(postId).subscribe(
      message => {
        console.log(message);
        this.replies.splice(postIndex, 1);
      },
      error => console.log(error)
    )
  }

  banUser(forumId: number, userId: number) {
    this.forumService.forumBanInteraction("ban", forumId, userId).subscribe(
      message => {
        console.log(message);
        this.shyncService.banSync(userId);
      },
      error => console.log(error)
    )
  }

  back() {
    history.back();
  }

  goHome() {
    this.router.navigate(['']);
  }

  goForumPage(forumId: number) {
    this.router.navigate([`/forum/${forumId}`]);
  }

  goUserPage(userId: number) {
    this.router.navigate([`/user/${userId}`]);
  }

  goThread(postId: number) {
    this.router.navigate([`/thread/${postId}`]);
  }

}