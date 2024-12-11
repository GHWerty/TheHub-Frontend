import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ForumService } from '../service/forum.service';
import { Forum } from '../model/Forum';

@Component({
  selector: 'app-forum-form-modal',
  templateUrl: './forum-form-modal.component.html',
  styleUrl: './forum-form-modal.component.css'
})
export class ForumFormModalComponent implements OnInit{

  showForm:boolean;
  status:string
  title:string;
  description:string;
  rules:string;
  @Input() forum:Forum;
  @Output() forumEmitter = new EventEmitter();
  
  constructor(private forumService:ForumService) {}

  ngOnInit(): void {
    this.showForm = false;
  }

  openForm(){
    this.showForm = true;
    if (this.forum != undefined){
      this.title = this.forum.title;
      this.status = this.forum.status;
      this.description = this.forum.description;
      this.rules = this.forum.rules;
    } else 
      this.clearForm();
  }

  closeForm(){
    this.showForm=false;
  }

  clearForm(){
    this.title = "";
    this.status = "";
    this.description = "";
    this.rules = "";
  }

  createForum(){
    let createdForum = new Forum(0, this.title, this.status, this.description, this.rules);
    this.forumService.createForum(createdForum).subscribe(
      forum => {
        this.forumEmitter.emit(forum);
        this.clearForm();
        this.closeForm();
      },
      error => console.log(error)
    )
  }

  updateForum(){
    let updatedForum = new Forum(this.forum.id, this.title, this.status, this.description, this.rules);
    this.forumService.updateForum(updatedForum).subscribe(
      forum => {
        this.forumEmitter.emit(forum);
        this.closeForm();
      },
      error => console.log(error)
    )
  }
}