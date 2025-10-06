import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatedDropdownComponent } from './paginated-dropdown.component';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PaginatedDropdownComponent', () => {
  let component: PaginatedDropdownComponent<any>;
  let fixture: ComponentFixture<PaginatedDropdownComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatedDropdownComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginatedDropdownComponent);
    component = fixture.componentInstance;

    // Provide a minimal fetchFn
    component.fetchFn = () => of({ items: [], hasMore: false, totalItems: 0 });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dataSource on ngOnInit', () => {
    component.ngOnInit();
    expect(component.dataSource).toBeDefined();
  });

  it('should call onChange when option is selected', () => {
    const spy = jest.fn();
    component.registerOnChange(spy);

    const testItem = { id: 1, name: 'Test' };
    component.onOptionSelected(testItem);

    expect(spy).toHaveBeenCalledWith(testItem);
  });
});
