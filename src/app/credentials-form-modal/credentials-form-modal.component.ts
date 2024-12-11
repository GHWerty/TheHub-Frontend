import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { User } from '../model/User';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-credentials-form-modal',
  templateUrl: './credentials-form-modal.component.html',
  styleUrl: './credentials-form-modal.component.css'
})
export class CredentialsFormModalComponent {

  @ViewChild('form') form: NgForm; 
  email:string;
  password:string;
  passwordvalidation:string;
  emailErrorMessage:string;
  passwordErrorMessage:string;
  showForm:boolean;

  constructor(private userService:UserService) {}

  ngOnInit(): void {
    this.showForm = false;
  }

  openForm(){
    this.showForm = true;
  }

  closeForm(){
    this.showForm=false;
    this.form.reset();
  }

  updateCredentials(){
    this.userService.updateCredentials(this.email, this.password).subscribe(
      result => {
        console.log(result)
        this.closeForm();
      },
      error => {
        if(error.status == 400){
          if (error.error.email){
            this.emailErrorMessage = error.error.email;
            this.form.controls['emailContent'].markAsPristine();
          }
          if (error.error.password){
            this.passwordErrorMessage = error.error.password;
            this.form.controls['passwordContent'].markAsPristine();
          }
        }
      }
    )
  }
}