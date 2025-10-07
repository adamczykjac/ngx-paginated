# @ngx-paginated/ui-paginated-dropdown

A feature-rich Angular Material dropdown component with virtual scrolling, infinite scroll, search, and full reactive forms integration.

## Features

- 🎨 **Material Design** - Built on Angular Material components
- ⚡ **Virtual Scrolling** - Efficiently render thousands of items using Angular CDK
- 🔄 **Infinite Scroll** - Load more items as users scroll
- 🔍 **Search** - Built-in debounced search functionality
- 📝 **Reactive Forms** - Full `ControlValueAccessor` implementation
- ✅ **Validation** - Integrates with Angular Forms validators
- ♿ **Accessible** - ARIA labels and keyboard navigation
- 🎯 **Customizable** - Configurable display functions, heights, thresholds
- 📱 **Responsive** - Works on all screen sizes

## Installation

```bash
npm install @ngx-paginated/ui-paginated-dropdown
```

### Peer Dependencies

```bash
npm install @angular/core@^20 @angular/common@^20 @angular/cdk@^20 @angular/material@^20 @angular/forms@^20 @ngx-paginated/data-source rxjs
```

### Setup

Add Angular Material theme to your `styles.css`:

```css
@import '@angular/material/prebuilt-themes/indigo-pink.css';
```

Add Material Icons to your `index.html`:

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
```

## Usage

### Basic Example

```typescript
import { Component, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PaginatedDataSource } from '@ngx-paginated/data-source';
import { PaginatedDropdownComponent, LabelledItem } from '@ngx-paginated/ui-paginated-dropdown';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    PaginatedDropdownComponent
  ],
  template: `
    <mat-form-field>
      <ngx-paginated-dropdown
        [formControl]="control"
        [items]="selectableItems()"
        [loading]="dataSource.loading()"
        [hasMore]="dataSource.hasMore()"
        (loadMore)="dataSource.loadNextPage()"
        (searched)="dataSource.setQuery($event)"
        placeholder="Select an item"
        noResultsText="No items found">
      </ngx-paginated-dropdown>
    </mat-form-field>
  `
})
export class ExampleComponent {
  control = new FormControl<LabelledItem | null>(null);

  dataSource = new PaginatedDataSource<LabelledItem>({
    fetchFn: (params) => this.fetchItems(params),
    pageSize: 10
  });

  selectableItems = computed(() =>
    this.dataSource.items().map(item => ({
      ...item,
      isSelected: item.id === this.control.value?.id,
      disabled: false
    }))
  );

  fetchItems(params) {
    // Your API call here
    return this.http.get('/api/items', { params });
  }
}
```

### With Form Group

```typescript
import { FormGroup, FormControl, Validators } from '@angular/forms';

export class FormExampleComponent {
  form = new FormGroup({
    category: new FormControl<LabelledItem | null>(null, [Validators.required]),
    priority: new FormControl<LabelledItem | null>(null)
  });

  onSubmit() {
    if (this.form.valid) {
      console.log('Selected:', this.form.value);
    }
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <mat-form-field>
    <mat-label>Category</mat-label>
    <ngx-paginated-dropdown
      formControlName="category"
      [items]="categoryItems()"
      [loading]="categoryDataSource.loading()"
      [hasMore]="categoryDataSource.hasMore()"
      (loadMore)="categoryDataSource.loadNextPage()"
      (searched)="categoryDataSource.setQuery($event)"
      placeholder="Select category">
    </ngx-paginated-dropdown>
    <mat-error *ngIf="form.get('category')?.hasError('required')">
      Category is required
    </mat-error>
  </mat-form-field>

  <button type="submit">Submit</button>
</form>
```

### Custom Display Functions

```typescript
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

export class CustomDisplayComponent {
  displayInput = (product: Product) => 
    product ? `${product.name} (${product.sku})` : '';

  displayOption = (product: Product) =>
    `${product.name} - $${product.price}`;
}
```

```html
<ngx-paginated-dropdown
  [formControl]="control"
  [items]="products()"
  [displayInputWith]="displayInput"
  [displayOptionWith]="displayOption">
</ngx-paginated-dropdown>
```

### Preselected Value

```typescript
export class PreselectedComponent implements OnInit {
  control = new FormControl<LabelledItem | null>(null);
  
  ngOnInit() {
    // Set initial value
    this.control.setValue({
      id: '123',
      label: 'Preselected Item',
      isSelected: true,
      disabled: false
    });
  }
}
```

### Disable Search

```html
<ngx-paginated-dropdown
  [formControl]="control"
  [items]="items()"
  [disableSearch]="true">
</ngx-paginated-dropdown>
```

## API Reference

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `items` | `LabelledSelectableItem[]` | `[]` | Array of items to display |
| `loading` | `boolean` | `false` | Loading state indicator |
| `hasMore` | `boolean` | `false` | Whether more items can be loaded |
| `placeholder` | `string` | `''` | Input placeholder text |
| `noResultsText` | `string` | `'No results found.'` | Text shown when no items match |
| `pageSize` | `number` | `10` | Items per page |
| `itemsInDropdown` | `number` | `5` | Visible items in dropdown |
| `itemSizePx` | `number` | `48` | Height of each item in pixels |
| `scrollThreshold` | `number` | `80` | Scroll percentage to trigger loadMore |
| `disableSearch` | `boolean` | `false` | Disable search functionality |
| `displayInputWith` | `(item: T) => string` | `item => item.label` | Function to format input display |
| `displayOptionWith` | `(item: T) => string` | `item => item.label` | Function to format option display |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `loadMore` | `void` | Emitted when more items should be loaded |
| `searched` | `string` | Emitted when search query changes (debounced 300ms) |

### Types

#### LabelledItem

```typescript
interface LabelledItem {
  id: string;
  label: string;
}
```

#### LabelledSelectableItem

```typescript
interface LabelledSelectableItem extends LabelledItem {
  isSelected: boolean;
  disabled?: boolean;
}
```

## Complete Example

Here's a full example with all features:

```typescript
import { Component, computed, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PaginatedDataSource, PaginationParams, PaginationResult } from '@ngx-paginated/data-source';
import { PaginatedDropdownComponent, LabelledItem, LabelledSelectableItem } from '@ngx-paginated/ui-paginated-dropdown';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-complete-example',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    PaginatedDropdownComponent
  ],
  template: `
    <form [formGroup]="form">
      <mat-form-field appearance="fill">
        <mat-label>Select Item</mat-label>
        <ngx-paginated-dropdown
          formControlName="selectedItem"
          placeholder="Choose an item"
          noResultsText="No items found"
          [items]="selectableItems()"
          [loading]="dataSource.loading()"
          [hasMore]="dataSource.hasMore()"
          [itemsInDropdown]="5"
          [scrollThreshold]="80"
          (loadMore)="dataSource.loadNextPage()"
          (searched)="dataSource.setQuery($event)">
        </ngx-paginated-dropdown>
        <mat-error *ngIf="form.get('selectedItem')?.hasError('required')">
          Please select an item
        </mat-error>
      </mat-form-field>

      <div *ngIf="form.value.selectedItem">
        Selected: {{ form.value.selectedItem.label }}
      </div>
    </form>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
    }
  `]
})
export class CompleteExampleComponent implements OnInit {
  form = new FormGroup({
    selectedItem: new FormControl<LabelledSelectableItem | null>(null, [
      Validators.required
    ])
  });

  // Mock data
  private allItems: LabelledItem[] = Array.from({ length: 100 }, (_, i) => ({
    id: `item-${i + 1}`,
    label: `Item ${i + 1}`
  }));

  dataSource = new PaginatedDataSource<LabelledItem>({
    fetchFn: (params) => this.fetchItems(params),
    pageSize: 10,
    concatData: true,
    triggerInitialFetch: true
  });

  selectableItems = computed(() =>
    this.dataSource.items().map(item => ({
      ...item,
      isSelected: item.id === this.form.value.selectedItem?.id,
      disabled: false
    }))
  );

  ngOnInit() {
    // Optionally set a preselected value
    // this.form.patchValue({ selectedItem: this.allItems[0] });
  }

  private fetchItems(params: PaginationParams): Observable<PaginationResult<LabelledItem>> {
    // Filter by query
    const filtered = params.query
      ? this.allItems.filter(item =>
          item.label.toLowerCase().includes(params.query!.toLowerCase())
        )
      : this.allItems;

    // Paginate
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const items = filtered.slice(start, end);

    return of({
      items,
      hasMore: end < filtered.length,
      totalItems: filtered.length
    }).pipe(delay(300)); // Simulate API delay
  }
}
```

## Styling

The component uses Angular Material styles. You can customize it using CSS:

```scss
::ng-deep {
  .mat-mdc-form-field {
    width: 100%;
  }

  .mat-mdc-autocomplete-panel {
    max-height: 256px !important; // Adjust dropdown height
  }
}
```

## Accessibility

The component includes:
- ARIA labels (`aria-expanded`, `aria-controls`)
- Keyboard navigation support
- Screen reader friendly
- Focusable elements with proper `tabindex`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
