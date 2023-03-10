import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { SignupComponent } from './signup/signup.component';
import { FormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [LoginComponent, SignupComponent],
  imports: [CommonModule, FormsModule, AngularMaterialModule],
})
export class AuthModule {}
