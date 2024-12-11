import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { User } from '../model/User';
import { UserService } from '../service/user.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-user-form-modal',
  templateUrl: './user-form-modal.component.html',
  styleUrl: './user-form-modal.component.css'
})
export class UserFormModalComponent {

  @ViewChild('form') form: NgForm; 
  showForm:boolean;
  nick:string;
  status:string;
  biography:string;
  nickErrorMesagge:string;
  @Input() user:User;
  @Output() userEmitter = new EventEmitter();

  constructor(private userService:UserService) {}

  ngOnInit(): void {
    this.showForm = false;
  }

  openForm(){
    this.showForm = true;
    this.nick = this.user.nick;
    this.status = this.user.status;
    this.biography = this.user.biography;
  }

  closeForm(){
    this.showForm=false;
    this.nickErrorMesagge = "";
  }

  updateUser(){
    let updatedUser = new User(this.user.id, this.nick, this.status, this.biography);
    this.userService.updateUser(updatedUser).subscribe(
      user => {
        this.userEmitter.emit(user);
        this.closeForm();
      }, error => {
        //El error proviene del backend. Se realiza la comprobación de ser único
        this.nickErrorMesagge = error.error.message;
        this.form.controls['nickContent'].markAsPristine();
      }
    )
  }
}
