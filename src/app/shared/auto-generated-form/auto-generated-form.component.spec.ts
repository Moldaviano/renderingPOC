import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoGeneratedFormComponent } from './auto-generated-form.component';

describe('AutoGeneratedFormComponent', () => {
  let component: AutoGeneratedFormComponent;
  let fixture: ComponentFixture<AutoGeneratedFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoGeneratedFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoGeneratedFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});