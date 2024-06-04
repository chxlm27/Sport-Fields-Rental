import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedserviceComponent } from './sharedservice.component';

describe('SharedserviceComponent', () => {
  let component: SharedserviceComponent;
  let fixture: ComponentFixture<SharedserviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharedserviceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedserviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
