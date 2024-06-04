import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { FetchFieldsComponent } from './fetch-fields/fetch-fields.component';
import { RentalsComponent } from './rentals/rentals.component';
import { UsersComponent } from './users/users.component';
import { AddFieldComponent } from './add-field/add-field.component';
import { EditFieldComponent } from './edit-field/edit-field.component';
import { SharedService } from './sharedservice/sharedservice.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyRentalsComponent } from './my-rentals/my-rentals.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { SearchBarComponent } from './searchbar/searchbar.component';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { PaymentComponent } from './payment/payment.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    RegisterComponent,
    CounterComponent,
    FetchDataComponent,
    FetchFieldsComponent,
    RentalsComponent,
    MyRentalsComponent,
    UsersComponent,
    EditFieldComponent,
    AddFieldComponent,
    PaymentComponent,
    SearchBarComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent },
      { path: 'fetch-fields', component: FetchFieldsComponent },
      { path: 'sportfield/:sportType', component: FetchFieldsComponent },
      { path: 'sportfield', component: FetchFieldsComponent },
      { path: 'edit-field/:id', component: EditFieldComponent },
      { path: 'rentals', component: RentalsComponent },
      { path: 'my-rentals', component: MyRentalsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'login', component: LoginComponent },
      { path: 'pay', component: PaymentComponent},
      { path: 'register', component: RegisterComponent },
      { path: 'add-field', component: AddFieldComponent },
    ]),
    BsDatepickerModule.forRoot(),
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
    MatSelect,
    MatFormFieldModule,
    MatFormField

  ],
  providers: [SharedService],
  bootstrap: [AppComponent]
})
export class AppModule { }
//merge pe master !!!!
