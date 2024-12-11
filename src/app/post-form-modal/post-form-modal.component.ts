import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Post } from '../model/Post';
import { PostService } from '../service/post.service';

@Component({
  selector: 'app-post-form-modal',
  templateUrl: './post-form-modal.component.html',
  styleUrl: './post-form-modal.component.css'
})
export class PostFormModalComponent {
  showForm: boolean;
  title: string;
  text: string;
  repliedPost: Post | null ;
  forumId: number | null;
  post: Post | null;
  @Output() postEmitter = new EventEmitter();

  constructor(private postService: PostService) { }

  ngOnInit(): void {
    this.showForm = false;
    this.clearForm();
  }

  openForm(){
    if (this.post != null){
      this.title = this.post.title;
      this.text = this.post.text
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.clearForm();
  }

  clearForm() {
    this.repliedPost = null;
    this.forumId = null;
    this.post = null;
    this.title = "";
    this.text = "";
  }

  createPost() {
    this.postService.createPost(this.forumId!, this.title, this.text).subscribe(
      post => {
        let action:string = "publicate";
        const postAction = {"post": post, "action": action}
        this.postEmitter.emit(postAction);
        console.log("Post publicado con éxito");
        this.closeForm();
      },
      error => console.log(error)
    )
  }

  createReply() {
    this.postService.createReply(this.repliedPost!.postId, this.repliedPost!.forumId,this.title, this.text).subscribe(
      post => {
        let action:string = "reply";
        const postAction = {"post": post, "repliedPostId": this.repliedPost?.postId, "action": action}
        this.postEmitter.emit(postAction);
        console.log("Respuesta publicada con éxito")
        this.closeForm();
      },
      error => console.log(error)
    )
  }

  updatePost() {
    this.postService.updatePost(this.post!.postId, this.title, this.text).subscribe(
      post => {
        let action:string = "edit";
        const postAction = {"post": post, "action": action}
        this.postEmitter.emit(postAction);
        console.log("Post actualizado con éxito")
        this.closeForm();
      },
      error => console.log(error)
    )
  }
}