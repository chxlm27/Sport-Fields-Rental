import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchBarComponent {
  @Input() placeholder: string = 'Search';
  @Output() searchEvent = new EventEmitter<string>();

  onInputChange(event: Event): void {
    const term = (event.target as HTMLInputElement)?.value;
    this.searchEvent.emit(term);
  }
}
