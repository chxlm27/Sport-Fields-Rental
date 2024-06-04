import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://localhost:44474'; // Adjust to your API URL
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  authStatus$ = this.authStatusSubject.asObservable();
  private decodedToken: any = null;

  constructor(private http: HttpClient) {
    this.checkAuthentication();
  }

  getUserId(): string | null {
    const tokenPayload = this.getDecodedToken();
    console.log('Token Payload:', tokenPayload);
    return tokenPayload ? tokenPayload.nameid : null;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/account/login`, { email, password }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    }).pipe(
      tap((data: any) => {
        const { token } = data;

        // Decode the token to extract the payload
        this.decodeAndCacheToken(token);

        // Extract userId and userEmail from the payload
        const userId = this.decodedToken?.nameid || null;
        const userEmail = this.decodedToken?.email || null;

        // Store user data and set authentication status
        this.storeUserData(token, userEmail, userId);
        this.setAuthStatus(true);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/account/register`, user);
  }

  logout(): Observable<any> {
    const token = this.getToken();

    if (!token) {
      return throwError('User not authenticated');
    }

    const tokenPayload = this.getDecodedToken();
    const expirationDate = new Date(tokenPayload.exp * 1000);

    if (expirationDate <= new Date()) {
      // Token is expired, attempt to refresh
      return this.refreshToken().pipe(
        switchMap((response: any) => {
          const newAccessToken = response.accessToken;

          // Update the access token in local storage
          localStorage.setItem('token', newAccessToken);

          // Proceed with logout logic
          const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newAccessToken}`,
          });

          return this.http.get<any>(`${this.baseUrl}/account/logout`, { headers });
        }),
        tap(() => this.handleLogoutSuccess()),
        catchError((error) => {
          console.error('Logout failed after token refresh', error);
          return throwError('Logout failed');
        })
      );
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(`${this.baseUrl}/account/logout`, { headers }).pipe(
      tap(() => this.handleLogoutSuccess()),
      catchError((error) => {
        console.error('Logout failed', error);
        return throwError('Logout failed');
      })
    );
  }

  private handleLogoutSuccess(): void {
    this.clearUserData();
    this.setAuthStatus(false);
  }

  public getUsername(): string | null {
    const tokenPayload = this.getDecodedToken();
    return tokenPayload ? tokenPayload.username : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getCurrentUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  logoutAndClearData(): void {
    this.logout().subscribe(() => {
      // Additional cleanup or redirection logic if needed
    });
  }

  private decodeAndCacheToken(token: string): void {
    console.log('Token:', token); // Log the entire token

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length < 3) {
        console.error('Invalid token format');
        this.decodedToken = null;
        return;
      }

      this.decodedToken = JSON.parse(atob(tokenParts[1]));
      console.log('Decoded Payload:', this.decodedToken); // Log the decoded payload
      console.log('Decoded User ID:', this.decodedToken?.nameid); // Log the user ID
    } catch (error) {
      console.error('Error decoding token', error);
      this.decodedToken = null;
    }
  }

  public decodeToken(): any {
    if (this.decodedToken) {
      return this.decodedToken;
    }

    const token = this.getToken();
    if (!token) {
      return null;
    }

    this.decodeAndCacheToken(token);
    return this.decodedToken;
  }

  public getDecodedToken(): any {
    if (!this.decodedToken) {
      this.decodeToken();
    }
    return this.decodedToken;
  }

  storeUserData(token: string, userEmail: string, userId: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', userEmail);
    localStorage.setItem('userId', userId); // Store the hashed user ID (nameid)
  }

  private clearUserData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    this.decodedToken = null;
  }

  private setAuthStatus(isAuthenticated: boolean): void {
    this.authStatusSubject.next(isAuthenticated);
  }

  public isTokenExpired(): boolean {
    const tokenPayload = this.getDecodedToken();
    if (!tokenPayload || !tokenPayload.exp) {
      return false;
    }

    const expirationDate = new Date(tokenPayload.exp * 1000);
    const bufferTime = 60 * 1000; // 1 minute buffer
    return expirationDate <= new Date(Date.now() + bufferTime);
  }

  private refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return throwError('Refresh token not found');
    }

    return this.http.post(`${this.baseUrl}/account/refresh-token`, { refreshToken }).pipe(
      catchError((error) => {
        console.error('Token refresh failed', error);
        return throwError('Token refresh failed');
      })
    );
  }

  isUserAdmin(): Observable<boolean> {
    const token = this.getToken();

    // Check if the token is available
    if (!token) {
      console.log('Token not available');
      return of(false);
    }

    const payload = this.getDecodedToken();
    if (!payload || !payload.nameid) {
      console.log('Invalid payload format');
      return of(false);
    }

    // Check if the user has the Admin role in the token payload
    if (payload.role && payload.role.includes('Admin')) {
      return this.http.get<boolean>(
        `${this.baseUrl}/account/is-admin/${payload.nameid}`,
        { headers: { 'Authorization': 'Bearer ' + token } }
      ).pipe(
        tap((isAdmin) => {
          console.log('API Response (Raw):', isAdmin); // Log the raw response
          console.log('Is Admin (Parsed):', !!isAdmin); // Log the parsed response
        }),
        catchError((error) => {
          // Handle errors gracefully
          return of(false);
        })
      );
    } else {
      // If the token doesn't indicate the user is an admin, skip the API call
      return of(false);
    }
  }

  checkAuthentication(): void {
    const isAuthenticated = this.isAuthenticated();

    if (!isAuthenticated || this.isTokenExpired()) {
      // Token is expired or not found, log the user out
      this.logoutAndClearData();
      return;
    }

    // Token is valid, update authentication status
    this.authStatusSubject.next(true);
  }
}
