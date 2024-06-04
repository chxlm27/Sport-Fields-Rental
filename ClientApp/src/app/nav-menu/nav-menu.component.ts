import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {
  isExpanded = false;
  public userEmail: string | null = null;
  public userId: string | null = null;
  public isAdmin: boolean = false;
  public isAuthenticated: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Subscribe to authentication status changes
    this.authService.authStatus$.subscribe((isAuthenticated: boolean) => {
      this.isAuthenticated = isAuthenticated;

      if (isAuthenticated) {
        this.updateUserData();
      } else {
        // Reset user data if not authenticated
        this.resetUserData();
      }
    });
  }

  private updateUserData(): void {
    const decodedToken = this.authService.decodeToken();
    this.userEmail = decodedToken?.email || null;
    this.userId = decodedToken?.nameid || null;

    if (this.userId && decodedToken?.role?.includes('Admin')) {
      // Check if the user is an admin
      this.authService.isUserAdmin().subscribe(
        (isAdminFromServer: boolean) => {
          this.isAdmin = isAdminFromServer;
        },
        () => {
          // Gracefully handle the error without logging it
          this.isAdmin = false; // Default to false in case of an error
        }
      );
    } else {
      this.isAdmin = false;
    }
  }

  private resetUserData(): void {
    this.userEmail = null;
    this.userId = null;
    this.isAdmin = false;
  }

  toggle(): void {
    this.isExpanded = !this.isExpanded;
  }

  logout(): void {
    this.authService.logout().subscribe(
      () => {
        // After successful logout, reset user data
        this.resetUserData();

        // Redirect to the home page
        this.router.navigate(['/']);
      },
      (error: any) => {
        console.error('Logout failed', error);
      }
    );
  }
}
