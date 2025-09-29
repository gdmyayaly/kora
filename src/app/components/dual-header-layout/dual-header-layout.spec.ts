import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DualHeaderLayout } from './dual-header-layout';

describe('DualHeaderLayout', () => {
  let component: DualHeaderLayout;
  let fixture: ComponentFixture<DualHeaderLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DualHeaderLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DualHeaderLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
