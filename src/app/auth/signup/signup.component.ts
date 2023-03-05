import { AuthService } from './../auth.service';
import { NgForm } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  isLoading = false;

  constructor(public authService: AuthService) {}

  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.isLoading = true;

    this.authService.createUser(form.value.email, form.value.password);
  }
}
