import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { User } from '../models/user.model';
import { BannerService } from '../banner.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registrationSuccess = false;
  registrationError: string | null = null;
  registrationForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private bannerService: BannerService
  ) {
    this.registrationForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*\d)(?=.*[^\da-zA-Z]).{6,}$/)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      address: ['', Validators.required],
      phoneNo: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });
  }

  get formControls() {
    return this.registrationForm.controls;
  }

  register() {
    if (this.registrationForm.invalid) {
      return;
    }

    const user: User = this.registrationForm.value;

    this.authService.register(user).subscribe(
      () => {
        this.bannerService.setSuccessBanner('Registration Successful');
        this.registrationSuccess = true;
        this.registrationError = null;

        // Login the user after successful registration
        this.authService.login(user.email, user.password).subscribe(
          () => {
            // Redirect to home page after successful login
            this.router.navigateByUrl('/');
          },
          error => {
            // Handle login error if needed
            console.error('Login error:', error);
          }
        );
      },
      error => {
        this.registrationSuccess = false;
        this.registrationError = this.extractErrorMessage(error);
      }
    );
  }

  private extractErrorMessage(error: any): string {
    const errorMessages = error?.error || [];
    return errorMessages.map((err: any) => err.description).join(', ') || 'Registration failed';
  }
}
