import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-fetch-fields',
  templateUrl: './fetch-fields.component.html',
  styleUrls: ['./fetch-fields.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ro-RO' }
  ]
})
export class FetchFieldsComponent implements OnInit {
  public fields: SportField[] = [];
  public rentals: Rental[] = [];
  sportType: string | null = null;
  public isAdmin$: Observable<boolean> | null = null;

  public showCalendar = false;
  public startDate: Date | null = null;
  public endDate: Date | null = null;
  public selectedField: SportField | null = null;
  public originalFields: SportField[] = [];
  public showSearchBar: boolean = true;
  public showFilters: boolean = false;
  public errorMessage: string | null = null;
  public successMessage: string | null = null;
  public minDate: Date = new Date();  // Initialize with today's date

  public sortByOptions: { label: string, value: string }[] = [
    { label: 'Price (Ascending)', value: 'priceAsc' },
    { label: 'Price (Descending)', value: 'priceDesc' },
    { label: 'Dimension: Small', value: 'small' },
    { label: 'Dimension: Medium', value: 'medium' },
    { label: 'Dimension: Large', value: 'large' },
    { label: 'Terrain Type: Indoors', value: 'indoors' },
    { label: 'Terrain Type: Outdoors', value: 'outdoors' }
  ];

  public selectedSortOption: string | null = null;
  private unavailableDates: { [fieldId: number]: Date[] } = {};

  getUniqueDimensions(): string[] {
    return Array.from(new Set(this.originalFields.map(field => field.dimension)));
  }

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    public location: Location,  // Inject the Location service
    @Inject('BASE_URL') private baseUrl: string
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.sportType = params.get('sportType');
      if (this.sportType) {
        this.fetchSportFieldsByType(this.sportType);  // Ensure this is the correct call
        this.showSearchBar = false;
        this.showFilters = true;
      } else {
        this.fetchAllSportFields();
        this.showSearchBar = true;
        this.showFilters = false;
      }
    });

    this.authService.authStatus$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.isAdmin$ = this.authService.isUserAdmin();
      }
    });

    // Ensure initial fetch of data to mark dates
    this.fetchRentalsAndMarkDates();
  }

  initializeComponentData(): void {
    this.route.paramMap.subscribe(params => {
      this.sportType = params.get('sportType');
      if (this.sportType) {
        this.fetchSportFieldsByType(this.sportType);
        this.showSearchBar = false;
        this.showFilters = true;
      } else {
        this.fetchAllSportFields();
        this.showSearchBar = true;
        this.showFilters = false;
      }
    });

    this.authService.authStatus$.subscribe((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        this.isAdmin$ = this.authService.isUserAdmin();
      }
    });
  }

  fetchRentalsAndMarkDates(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize the time to midnight

    this.http.get<Rental[]>(`${this.baseUrl}rentals/activeFromDate`, {
      params: { startDate: today.toISOString().split('T')[0] }
    }).subscribe(
      rentals => {
        this.markUnavailableDates(rentals);
      },
      error => {
        console.error('Failed to fetch rentals:', error);
        this.errorMessage = 'Failed to load rental data.';
        setTimeout(() => {
          this.errorMessage = null;
        }, 5000);
      }
    );
  }

  toggleCalendar(field: SportField): void {
    this.selectedField = this.selectedField === field ? null : field;
    this.showCalendar = !!this.selectedField; // Show calendar if selectedField is not null
  }

  rentFieldRedirect(field: SportField, startDate: Date, endDate: Date): void {
    if (!this.authService.isAuthenticated()) {
      console.error("Not authenticated");
      return;
    }
    const rental: Rental = {
      userId: this.authService.decodeToken().nameid,
      terrainName: field.terrainName,
      sportFieldId: field.id,
      pricePerHour: field.price,
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    };

    // Store rental data in local storage
    localStorage.setItem('rental', JSON.stringify(rental));

    // Navigate to the payment page
    this.router.navigate(['/pay']);
  }




  dateFilter = (date: Date | null): boolean => {
    if (!date || !this.selectedField) {
      return false;
    }
    const currentDateMs = date.getTime();
    const fieldId = this.selectedField.id;
    const dates = this.unavailableDates[fieldId] || [];
    return !dates.some(unavailableDate => currentDateMs === unavailableDate.getTime());
  };


  checkDateAvailability(startDate: Date, endDate: Date, fieldId: number): Observable<Rental[]> {
    return this.http.get<Rental[]>(`${this.baseUrl}rentals/dateFilter`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        fieldId: fieldId.toString()
      }
    });
  }

  markUnavailableDates(rentals: Rental[]): void {
    rentals.forEach(rental => {
      if (!this.unavailableDates[rental.sportFieldId]) {
        this.unavailableDates[rental.sportFieldId] = [];
      }
      let currentDate = new Date(rental.startDate);
      const endDate = new Date(rental.endDate);
      while (currentDate <= endDate) {
        this.unavailableDates[rental.sportFieldId].push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
  }

  // trebuie din start - pe ngOnInit (sport-field / rental ) sa fie apelata (de pe teren).
  // Construiesc un Rental[] cu rentaluri din baza de date din viitor pentru acest teren.
  // Asta inseamna un call in DB. 


  fetchSportFieldsByType(sportType: string): void {
    this.http.get<SportField[]>(`${this.baseUrl}sportfield/${sportType}`).subscribe(
      (result) => {
        this.fields = result;
        this.originalFields = [...result]; // Assuming you want to keep a copy of the original fields
      },
      (error) => {
        console.error(`Error fetching sport fields for type ${sportType}:`, error);
      }
    );
  }

  fetchAllSportFields(): void {
    this.http.get<SportField[]>(`${this.baseUrl}sportfield`).subscribe(
      (result) => {
        this.originalFields = this.filterDuplicates(result, 'sportType');
        this.fields = [...this.originalFields];
      },
      (error) => {
        console.error('Error fetching all sport fields:', error);
      }
    );
  }

  private filterDuplicates(data: SportField[], property: string): SportField[] {
    const uniqueValues = new Set();
    const uniqueData: SportField[] = [];

    for (const item of data) {
      if (!uniqueValues.has(item[property as keyof SportField])) {
        uniqueValues.add(item[property as keyof SportField]);
        uniqueData.push(item);
      }
    }

    return uniqueData;
  }

  onSearch(term: string): void {
    if (term.trim() !== '') {
      this.fields = this.originalFields.filter(field =>
        field.sportType.toLowerCase().includes(term.toLowerCase())
      );
    } else {
      this.fields = [...this.originalFields];
    }
  }

  deleteField(id: number): void {
    this.http.delete(`/sportfield/${id}`).subscribe(
      () => {
        console.log('Field deleted successfully');
        this.router.navigate(['/fetch-fields']);
      },
      (error) => {
        console.error('Error deleting field:', error);
      }
    );
  }

  editField(field: SportField): void {
    this.http.put(`/sportfield/${field.id}`, field).subscribe(
      () => {
        console.log('Field updated successfully');
        this.router.navigate(['/fetch-fields']);
      },
      (error) => {
        console.error('Error updating field:', error);
      }
    );
  }


  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  redirectToSport(sportType: string): void {
    this.router.navigate([`/sportfield/${sportType.toLowerCase()}`]);
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>): void {
    const selectedDate = event.value;

    if (type === 'start' && selectedDate) {
      this.startDate = selectedDate;
      this.minDate = selectedDate;
      // Check if end date is valid
      if (this.endDate && this.endDate <= this.startDate) {
        // If end date is not at least one day after start date, reset end date
        this.endDate = null;
      }
    } else if (type === 'end' && selectedDate) {
      // Check if end date is valid
      if (selectedDate && this.startDate && selectedDate <= this.startDate) {
        // If end date is not at least one day after start date, reset end date
        this.endDate = null;
        console.error('End date must be at least one day after start date');
      } else {
        this.endDate = selectedDate;
      }
    }
  }


  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  sortFields(): void {
    let sortedAndFilteredFields: SportField[] = [];

    if (this.selectedSortOption === 'priceAsc') {
      sortedAndFilteredFields = this.sortFieldsByPriceAsc([...this.originalFields]);
    } else if (this.selectedSortOption === 'priceDesc') {
      sortedAndFilteredFields = this.sortFieldsByPriceDesc([...this.originalFields]);
    } else if (['large', 'medium', 'small'].includes(this.selectedSortOption || '')) {
      sortedAndFilteredFields = this.filterFieldsByDimension(this.selectedSortOption || '', [...this.originalFields]);
    } else if (this.selectedSortOption === 'indoors') {
      sortedAndFilteredFields = this.filterFieldsByIndoors([...this.originalFields]);
    } else if (this.selectedSortOption === 'outdoors') {
      sortedAndFilteredFields = this.filterFieldsByOutdoors([...this.originalFields]);
    } else {
      sortedAndFilteredFields = [...this.originalFields];
    }

    this.fields = sortedAndFilteredFields;
  }

  sortFieldsByPriceAsc(fields: SportField[]): SportField[] {
    return fields.sort((a, b) => a.price - b.price);
  }

  sortFieldsByPriceDesc(fields: SportField[]): SportField[] {
    return fields.sort((a, b) => b.price - a.price);
  }

  filterFieldsByDimension(dimension: string, fields: SportField[]): SportField[] {
    if (this.sportType) {
      return fields.filter(field =>
        field.sportType!.toLowerCase() === this.sportType!.toLowerCase() &&
        field.dimension!.toLowerCase() === dimension.toLowerCase()
      );
    } else {
      return fields.filter(field =>
        field.dimension!.toLowerCase() === dimension.toLowerCase()
      );
    }
  }

  filterFieldsByIndoors(fields: SportField[]): SportField[] {
    return fields.filter(field =>
      field.terrainType?.toLowerCase() === 'indoors'
    );
  }

  filterFieldsByOutdoors(fields: SportField[]): SportField[] {
    return fields.filter(field =>
      field.terrainType?.toLowerCase() === 'outdoors'
    );
  }

  isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  private clearUnavailableDates(): void {
    this.unavailableDates = [];
  }

  private handleOverlapError(): void {
    this.errorMessage = 'Selected dates are not available for rent. Please choose different dates.';
    setTimeout(() => {
      this.errorMessage = null;
    }, 15000);

    this.successMessage = null;
  }

  private handleCheckDateAvailabilityError(): void {
    this.errorMessage = 'Error checking date availability. Please try again.';
    setTimeout(() => {
      this.errorMessage = null;
    }, 15000);

    this.successMessage = null;
  }
}

interface SportField {
  id: number;
  terrainName: string;
  sportType: string;
  dimension: string;
  terrainType: string;
  price: number;
  urlPath: string;
}

interface Rental {
  userId: string;
  terrainName: string;
  sportFieldId: number;
  pricePerHour: number;
  startDate: string;
  endDate: string;
}
