import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { BannerService } from '../banner.service'; // Import BannerService
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public userEmail: string | null = null;
  public userId: string | null = null;
  public isAdmin$: Observable<boolean> | null = null;
  public successBanner: string | null = null; // Add success banner variable

  constructor(
    private authService: AuthService,
    private bannerService: BannerService // Inject BannerService
  ) { }

  ngOnInit(): void {
    this.updateUserData();

    this.authService.authStatus$.subscribe((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        this.updateUserData();
        this.isAdmin$ = this.authService.isUserAdmin();
      }
    });

    // Retrieve success banner message
    this.successBanner = this.bannerService.getSuccessBanner();

    // Clear success banner from the service
    this.bannerService.clearSuccessBanner();

    // Clear success banner after 3 seconds
    setTimeout(() => {
      this.successBanner = null;
    }, 3000);
  }

  private updateUserData(): void {
    const decodedToken = this.authService.decodeToken();

    if (decodedToken) {
      this.userEmail = decodedToken.email || null;
      this.userId = decodedToken.nameid || null;
    }
  }
}
