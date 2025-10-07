import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PaginatedDataSource, PaginationParams, PaginationResult, FetchFn } from '@ngx-paginated/data-source';
import { PaginatedDropdownComponent, LabelledItem, LabelledSelectableItem } from '@ngx-paginated/ui-paginated-dropdown';
import { Observable, of } from 'rxjs';
import { delay, tap, map } from 'rxjs/operators';

// Mock data generator
function generateMockItems(count: number = 100): LabelledItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    label: `Item ${i + 1}`,
  }));
}

// Fetch function that simulates API calls
function fetchItems(params: PaginationParams): PaginationResult<LabelledItem> {
  const allItems = generateMockItems(100);
  
  // Filter by search query if provided
  const filtered = !params.query
    ? allItems
    : allItems.filter(item =>
        item.label.toLowerCase().includes(params.query!.toLowerCase())
      );
  
  // Calculate pagination
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const items = filtered.slice(start, end);
  const hasMore = end < filtered.length;
  const totalItems = filtered.length;

  return { items, hasMore, totalItems };
}

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    PaginatedDropdownComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'Angular Material Paginated Dropdown Demo';

  form = new FormGroup({
    selectedItem: new FormControl<LabelledSelectableItem | null>(null, [Validators.required]),
  });

  fetchItemsFn: FetchFn<LabelledItem> = (params: PaginationParams): Observable<PaginationResult<LabelledItem>> => {
    // Simulate API delay
    return of(fetchItems(params)).pipe(
      delay(500),
      tap(() => console.log('Fetch page for', JSON.stringify(params), 'completed')),
    );
  };

  dataSource = new PaginatedDataSource<LabelledItem>({ 
    fetchFn: this.fetchItemsFn,
    pageSize: 10,
    concatData: true,
    triggerInitialFetch: true,
  });

  // Convert LabelledItem to LabelledSelectableItem
  selectableItems = computed(() => 
    this.dataSource.items().map(item => ({
      ...item,
      isSelected: false,
      disabled: false,
    }))
  );

  preselectedItem: LabelledSelectableItem | null = null;

  ngOnInit(): void {
    if (!this.preselectedItem) return;
    this.form.get('selectedItem')!.setValue(this.preselectedItem);
  }

  // Helper method to display selected value
  get selectedValue() {
    return this.form.get('selectedItem')?.value;
  }
}
