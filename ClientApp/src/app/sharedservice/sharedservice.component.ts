// shared.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private selectedUserId: number | null = null;

  setSelectedUserId(userId: number): void {
    this.selectedUserId = userId;
  }

  getSelectedUserId(): number | null {
    return this.selectedUserId;
  }
}
