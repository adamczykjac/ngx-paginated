import { Component, Input, forwardRef, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PaginatedDataSource, FetchFn } from '@ngx-paginated/data-source';
import { AsyncPipe } from '@angular/common';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';

/**
 * A Material autocomplete component with paginated data loading.
 * 
 * Features:
 * - Virtual scrolling for large lists
 * - Automatic pagination on scroll
 * - Search query support
 * - ControlValueAccessor support for reactive forms
 * 
 * @example
 * ```html
 * <lib-ui-material-autocomplete
 *   [fetchFn]="loadUsers"
 *   [displayWith]="userDisplayFn"
 *   [(ngModel)]="selectedUser"
 *   placeholder="Select a user">
 * </lib-ui-material-autocomplete>
 * ```
 */
@Component({
  selector: 'lib-ui-material-autocomplete',
  standalone: true,
  imports: [
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    AsyncPipe,
    ScrollingModule
  ],
  templateUrl: './ui-material-autocomplete.html',
  styleUrl: './ui-material-autocomplete.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiMaterialAutocomplete),
      multi: true
    }
  ]
})
export class UiMaterialAutocomplete<T> implements ControlValueAccessor, OnInit {
  /**
   * Function to fetch paginated data.
   */
  @Input({ required: true }) fetchFn!: FetchFn<T>;

  /**
   * Function to display the selected item.
   */
  @Input() displayWith: (item: T) => string = (item) => String(item);

  /**
   * Placeholder text for the input.
   */
  @Input() placeholder = 'Search...';

  /**
   * Page size for pagination.
   */
  @Input() pageSize = 20;

  /**
   * Virtual scroll item height in pixels.
   */
  @Input() itemHeight = 48;

  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  searchControl = new FormControl<string>('');
  dataSource!: PaginatedDataSource<T>;

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.dataSource = new PaginatedDataSource({
      fetchFn: this.fetchFn,
      pageSize: this.pageSize,
      concatData: true,
      triggerInitialFetch: true
    });

    // Update query on search input changes
    this.searchControl.valueChanges.subscribe(query => {
      this.dataSource.setQuery(query || '');
    });
  }

  onOptionSelected(item: T): void {
    this.onChange(item);
    this.onTouched();
  }

  onScroll(): void {
    if (!this.viewport) return;
    
    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();
    
    // Load next page when user scrolls near the end
    if (end >= total - 5 && this.dataSource.hasMore()) {
      this.dataSource.loadNextPage();
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: T | null): void {
    if (value && this.displayWith) {
      this.searchControl.setValue(this.displayWith(value), { emitEvent: false });
    } else {
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.searchControl.disable() : this.searchControl.enable();
  }
}
