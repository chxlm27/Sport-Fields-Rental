import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface Rental {
  userId: string;
  terrainName: string;
  sportFieldId: number;
  pricePerHour: number;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-payment-component',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  public paymentForm: FormGroup;
  public showSuccessBanner = false;
  public errorMessage: string | null = null;
  public rental: Rental | null = null;
  public cardNumberMessage: string = '';
  public expiryDateMessage: string = '';
  public cvvMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject('BASE_URL') private baseUrl: string
  ) {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3}$/)]],
    });

    this.paymentForm.get('cardNumber')?.valueChanges.subscribe(value => {
      this.updateCardNumberMessage(value);
    });

    this.paymentForm.get('expiryDate')?.valueChanges.subscribe(value => {
      this.updateExpiryDateMessage(value);
    });

    this.paymentForm.get('cvv')?.valueChanges.subscribe(value => {
      this.updateCvvMessage(value);
    });
  }

  ngOnInit(): void {
    this.retrieveRentalData();
  }

  retrieveRentalData(): void {
    const rentalData = localStorage.getItem('rental');
    if (rentalData) {
      this.rental = JSON.parse(rentalData);
    } else {
      console.error('No rental data available in local storage');
    }
  }

  rentField(): void {
    if (this.paymentForm.invalid) {
      this.errorMessage = 'Please enter valid payment details.';
      return;
    }

    if (!this.rental) {
      this.errorMessage = 'No rental data available.';
      return;
    }

    // Assuming payment is always successful for the sake of this example
    const paymentDetails: PaymentDetails = this.paymentForm.value;
    console.log('Payment details:', paymentDetails);

    // Proceed to rent the field
    this.performRent(this.rental);
  }

  performRent(rental: Rental): void {
    if (!this.authService.isAuthenticated()) {
      console.error("Not authenticated");
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });

    const apiUrl = `${this.baseUrl}rentals`;

    this.http.post<Rental>(apiUrl, rental, { headers })
      .subscribe({
        next: (response) => {
          console.log('Field rented successfully', response);
          this.showSuccessBanner = true;

          setTimeout(() => {
            this.router.navigate(['/my-rentals']); // Redirect after successful rent
            this.showSuccessBanner = false; // Optionally reset the success banner state
          }, 1500); // Delay in milliseconds (1500 ms = 1.5 seconds)

        },
        error: (error) => {
          console.error('Error renting field:', error);
          this.errorMessage = 'Error renting field. Please try again.';
          setTimeout(() => {
            this.errorMessage = null;
          }, 5000);
        }
      });
  }

  public calculateTotalPrice(): number {
    if (!this.rental) {
      return 0;
    }
    const startDate = new Date(this.rental.startDate);
    const endDate = new Date(this.rental.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24) + 1);
    return diffDays * this.rental.pricePerHour;
  }

  private updateCardNumberMessage(value: string): void {
    if (value.length < 16) {
      this.cardNumberMessage = `Card number must be 16 digits. (${value.length}/16)`;
    } else {
      this.cardNumberMessage = '';
    }
  }

  private updateExpiryDateMessage(value: string): void {
    const expiryDatePattern = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!expiryDatePattern.test(value)) {
      this.expiryDateMessage = 'Expiry date must be in MM/YY format.';
    } else {
      this.expiryDateMessage = '';
    }
  }

  private updateCvvMessage(value: string): void {
    if (value.length < 3) {
      this.cvvMessage = `CVV must be 3 digits. (${value.length}/3)`;
    } else {
      this.cvvMessage = '';
    }
  }
}
