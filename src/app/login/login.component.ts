import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  @ViewChild('form') form: NgForm;
  email:string;
  password:string;
  emailErrorMessage:string;
  passwordErrorMessage:string;

  constructor(private authenticationService:AuthenticationService, private router: Router){}

  clearForm(){
    this.email = "";
    this.password = "";
    this.form.resetForm();
  }

  clearErrors(){
    this.emailErrorMessage = "";
    this.passwordErrorMessage = "";
  }

  iniciarSesion(){
    this.clearErrors();
    this.authenticationService.login(this.email, this.password).subscribe(
      result => {
        console.log(result);
        this.router.navigate(['']);
      },
      error => {
        if (error.status == 404){
          this.emailErrorMessage = error.error.message;
        }
        else if (error.status == 400)
          this.passwordErrorMessage = error.error.message;
        this.clearForm();
      }
    )
  }
}
