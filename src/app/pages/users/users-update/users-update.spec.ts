import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersUpdate } from './users-update';

describe('UsersUpdate', () => {
  let component: UsersUpdate;
  let fixture: ComponentFixture<UsersUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersUpdate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
