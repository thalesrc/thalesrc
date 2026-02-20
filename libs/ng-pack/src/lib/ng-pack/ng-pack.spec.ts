import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgPack } from './ng-pack';

describe('NgPack', () => {
  let component: NgPack;
  let fixture: ComponentFixture<NgPack>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgPack],
    }).compileComponents();

    fixture = TestBed.createComponent(NgPack);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
