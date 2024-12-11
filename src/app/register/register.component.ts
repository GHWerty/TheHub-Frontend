import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from '../service/authentication.service';
import { Router } from '@angular/router';
import { User } from '../model/User';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  @ViewChild('form') form: NgForm;
  nick:string;
  email:string;
  password:string;
  passwordvalidation:string;
  nickErrorMessage:string;
  emailErrorMessage:string;

  constructor(private authenticationService:AuthenticationService, private router: Router){}

  clearErrors(){
    this.nickErrorMessage = "";
    this.emailErrorMessage = "";
  }

  registrarUsuario(){
    this.clearErrors();
    this.authenticationService.register(this.nick, this.email, this.password).subscribe(
      result => {
        console.log(result);
        this.router.navigate(['']);
      },
      error => {
        this.form.reset();
        if(error.error.nick)
          this.nickErrorMessage = error.error.nick;
        if(error.error.email)
          this.emailErrorMessage = error.error.email;
        this.form.reset();
      }
    )
  }

}
