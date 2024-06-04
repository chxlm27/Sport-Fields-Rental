import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchFieldsComponent } from './fetch-fields.component';

describe('FetchFieldsComponent', () => {
  let component: FetchFieldsComponent;
  let fixture: ComponentFixture<FetchFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FetchFieldsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FetchFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
