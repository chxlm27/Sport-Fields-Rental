import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-rentals',
  templateUrl: './rentals.component.html',
  styleUrls: ['./rentals.component.css']
})
export class RentalsComponent implements OnInit {
  public rentals: Rental[] = [];
  public users: User[] = [];
  public sportFields: SportField[] = [];
  public selectedStartDate: Date | null = null;
  public selectedEndDate: Date | null = null;
  public filterOption: string = 'all';
  public searchTerm: string = '';
  public filteredRentals: Rental[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject('BASE_URL') private baseUrl: string
  ) { }

  ngOnInit(): void {
    this.fetchRentals();
    this.fetchUsers();
    this.fetchSportFields();
  }

  fetchRentals(): void {
    this.http.get<Rental[]>(`${this.baseUrl}rentals`).subscribe(result => {
      this.rentals = result.map(rental => ({
        ...rental,
        totalDays: this.calculateTotalDays(rental.startDate, rental.endDate),
        totalPrice: this.calculateTotalPrice(rental.pricePerHour, this.calculateTotalDays(rental.startDate, rental.endDate))
      }));
      this.updateFilteredRentals();
    }, error => console.error(error));
  }

  private calculateTotalDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24) + 1);
  }

  private calculateTotalPrice(pricePerHour: number, totalDays: number): number {
    return pricePerHour * totalDays;
  }

  fetchUsers(): void {
    this.http.get<User[]>(`${this.baseUrl}users`).subscribe(result => {
      this.users = result;
      this.updateFilteredRentals(); // Ensure users are fetched before filtering
    }, error => console.error(error));
  }

  fetchSportFields(): void {
    this.http.get<SportField[]>(`${this.baseUrl}sportfield`).subscribe(result => {
      this.sportFields = result;
    }, error => console.error(error));
  }

  getUserEmail(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.email : '';
  }

  updateFilteredRentals(): void {
    const currentDate = new Date();
    this.filteredRentals = this.rentals.filter(rental => {
      const matchesFilter = (() => {
        switch (this.filterOption) {
          case 'past': return new Date(rental.endDate) < currentDate;
          case 'active': return new Date(rental.startDate) <= currentDate && new Date(rental.endDate) >= currentDate;
          case 'future': return new Date(rental.startDate) > currentDate;
          default: return true;
        }
      })();

      const userEmail = this.getUserEmail(rental.userId).toLowerCase();
      const terrainName = rental.terrainName.toLowerCase();
      const pricePerHour = rental.pricePerHour.toString();
      const startDate = rental.startDate.toLowerCase();
      const endDate = rental.endDate.toLowerCase();
      const totalDays = (rental.totalDays ?? '').toString();  // Handle undefined totalDays
      const totalPrice = (rental.totalPrice ?? '').toString();  // Handle undefined totalPrice

      const matchesSearch = [userEmail, terrainName, pricePerHour, startDate, endDate, totalDays, totalPrice]
        .some(value => value.includes(this.searchTerm.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }

  onFilterChange(event: any): void {
    this.filterOption = event.value;
    this.updateFilteredRentals();
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.updateFilteredRentals();
  }
}

export interface SportField {
  id: number;
  sportType: string;
  dimension: string;
  terrainType: string;
  price: number;
  urlPath: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  email: string;
  phoneNo: string;
}

interface Rental {
  id?: number;
  userId: number;
  terrainName: string;
  sportFieldId: number;
  pricePerHour: number;
  startDate: string;
  endDate: string;
  sportField: SportField;
  totalDays?: number;
  totalPrice?: number;
}
