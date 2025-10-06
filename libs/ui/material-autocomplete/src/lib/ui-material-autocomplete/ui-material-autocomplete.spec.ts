import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiMaterialAutocomplete } from './ui-material-autocomplete';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('UiMaterialAutocomplete', () => {
  let component: UiMaterialAutocomplete<any>;
  let fixture: ComponentFixture<UiMaterialAutocomplete<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiMaterialAutocomplete, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UiMaterialAutocomplete);
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
