// banner.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private successBanner: string | null = null;

  constructor() { }

  setSuccessBanner(message: string) {
    this.successBanner = message;
  }

  getSuccessBanner(): string | null {
    return this.successBanner;
  }

  clearSuccessBanner() {
    this.successBanner = null;
  }
}
