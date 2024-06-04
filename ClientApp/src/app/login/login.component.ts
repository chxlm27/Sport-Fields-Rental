import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loginError: string = '';

  constructor(
    private authService: AuthService,
    private router: Router // Inject Router
  ) { }

  login() {
    this.loginError = '';

    this.authService.login(this.email, this.password).subscribe(
      () => {
        // Redirect to homepage after successful login
        this.router.navigateByUrl('/');
      },
      error => {
        console.error(error);
        if (error.status === 401) {
          this.loginError = 'Invalid email or password';
        } else {
          this.loginError = 'An unexpected error occurred. Please try again later.';
        }
      }
    );
  }
}
