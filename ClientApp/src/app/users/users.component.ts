// users.component.ts
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../sharedservice/sharedservice.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  public users: Users[] = [];
  public searchTerm: string = '';
  public filteredUsers: Users[] = [];
  public searchPlaceholder: string = 'Search for users';
  public selectedSortOption: string = 'default';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService,
    @Inject('BASE_URL') private baseUrl: string
  ) { }

  ngOnInit(): void {
    this.fetchUsers();
    this.setPlaceholderText('users');
  }

  fetchUsers(): void {
    this.http.get<Users[]>(`${this.baseUrl}users`).subscribe(result => {
      this.users = result;
      this.updateFilteredUsers();
    }, error => console.error(error));
  }

  updateFilteredUsers(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user =>
        Object.values(user).some(value =>
          value && value.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }
    this.sortUsers(); // Ensure sorting after filtering
  }

  sortUsers(): void {
    switch (this.selectedSortOption) {
      case 'alphabetical':
        this.sortUsersAlphabetically();
        break;
      case 'alphabeticalDesc':
        this.sortUsersAlphabeticallyDesc();
        break;
      default:
        // For 'default' or any other options, maintain the current order
        break;
    }
  }

  sortUsersAlphabetically(): void {
    this.filteredUsers.sort((a, b) => a.firstName.localeCompare(b.firstName));
  }

  sortUsersAlphabeticallyDesc(): void {
    this.filteredUsers.sort((a, b) => b.firstName.localeCompare(a.firstName));
  }

  resetSearch(): void {
    this.searchTerm = '';
    this.updateFilteredUsers();
  }

  selectUser(userId: number): void {
    this.sharedService.setSelectedUserId(userId);
  }

  setPlaceholderText(section: string): void {
    this.searchPlaceholder = `Search for ${section}`;
  }
}

interface Users {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  email: string;
  phoneNo: string;
}
