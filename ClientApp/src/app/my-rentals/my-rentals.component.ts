import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-my-rentals',
  templateUrl: './my-rentals.component.html',
  styleUrls: ['./my-rentals.component.css']
})
export class MyRentalsComponent implements OnInit {
  public myRentals: Rental[] = [];
  public filterOption: string = 'all';
  public successMessage: string | null = null;  // Property for success message

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.fetchMyRentals();
  }

  fetchMyRentals(): void {
    const decodedToken = this.authService.decodeToken();
    if (decodedToken) {
      const userId = decodedToken.nameid || null;
      const authToken = this.authService.getToken();
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      });

      const url = `https://localhost:44474/rentals/user`;
      this.http.get<Rental[]>(url, { headers }).subscribe(
        result => {
          this.myRentals = result.map(rental => ({
            ...rental,
            totalDays: this.calculateTotalDays(rental.startDate || '', rental.endDate || ''),
            totalPrice: this.calculateTotalPrice(rental.pricePerHour, this.calculateTotalDays(rental.startDate || '', rental.endDate || ''))
          }));
        },
        error => console.error('Error fetching my rentals:', error)
      );
    } else {
      console.error('User ID is null');
    }
  }

  calculateTotalDays(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24) + 1);  // Convert milliseconds to days and round up
  }

  calculateTotalPrice(pricePerHour: number, totalDays: number): number {
    return pricePerHour * totalDays; // Assuming pricePerHour is actually the daily rate
  }

  filteredRentals(): Rental[] {
    const currentDate = new Date();
    return this.myRentals.filter(rental => {
      switch (this.filterOption) {
        case 'past': return new Date(rental.endDate || '') < currentDate;
        case 'active': return new Date(rental.startDate || '') <= currentDate && new Date(rental.endDate || '') >= currentDate;
        case 'future': return new Date(rental.startDate || '') > currentDate;
        default: return true;
      }
    });
  }

  onFilterChange(event: MatSelectChange): void {
    this.filterOption = event.value;
  }

  cancelRental(rentalId?: number): void {
    if (!rentalId) {
      console.error('Invalid rentalId');
      return;
    }
    const authToken = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    });

    this.http.delete(`https://localhost:44474/rentals/cancel/${rentalId}`, { headers }).subscribe(
      () => {
        this.myRentals = this.myRentals.filter(rental => rental.id !== rentalId);
        this.successMessage = "The rental has been successfully cancelled and your payment has been refunded.";  // Set professional success message
        setTimeout(() => this.successMessage = null, 4000);  // Hide the message after 4 seconds
        console.log(`Cancelled rental with ID ${rentalId}`);
      },
      error => console.error(`Error cancelling rental with ID ${rentalId}:`, error)
    );
  }
}

export interface Rental {
  id?: number;
  terrainName: string;
  userId: number;
  sportFieldId: number;
  pricePerHour: number;
  startDate: string | null;
  endDate: string | null;
  sportField?: SportField;
  totalDays?: number;
  totalPrice?: number;
}

export interface SportField {
  id: number;
  terrainName: string;
  sportType: string;
  dimension: string;
  terrainType: string;
  price: number;
  urlPath: string;
}
