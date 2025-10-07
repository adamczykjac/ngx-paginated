import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { FormFieldDropdownBase } from './form-field.dropdown-base';
import { LabelledSelectableItem } from '../models/display-fn';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AutocompletePositionUtil } from './autocomplete-position.util';
import { OverlayPositionBuilder } from '@angular/cdk/overlay';

@Component({
  selector: 'ngx-paginated-dropdown',
  templateUrl: './paginated-dropdown.component.html',
  styleUrls: ['./paginated-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatInputModule,
    MatIconModule,
    ScrollingModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: PaginatedDropdownComponent,
    },
  ],
})
export class PaginatedDropdownComponent<T extends LabelledSelectableItem>
  extends FormFieldDropdownBase<T>
  implements OnInit, AfterViewInit
{
  readonly loadMore = output<void>();
  readonly searched = output<string>();

  private positionBuilder = inject(OverlayPositionBuilder);
  private positionUtil = new AutocompletePositionUtil(this.positionBuilder, this._elementRef);

  cdkVirtualScrollViewPort = viewChild(CdkVirtualScrollViewport);

  noResultsText = input<string>('No results found.');
  hasMore = input<boolean>(false);
  currentPage = input<number>(1);
  pageSize = input<number>(10);
  scrollThreshold = input<number>(80);
  itemSizePx = input<number>(48);
  itemsInDropdown = input<number>(5);
  disableSearch = input<boolean>(false);

  opened = signal(false);
  previousScrollIndex = signal(0);
  selectedValue = signal<T | null>(null);
  itemsEnriched = computed(() => {
    if (this.hasEmptyResults()) {
      const noResultsItem = {
        id: '__no_results__',
        label: this.noResultsText(),
        disabled: true,
      } as T & { disabled: boolean };
      return [noResultsItem];
    }

    const enrichedItems = this.items().map(item => ({
      ...item,
      label: this.displayOptionWith?.(item) ?? item.label,
      isSelected: item.id === this.selectedValue()?.id,
    }));

    return enrichedItems;
  });
  displayedItems = signal<T[]>([]);
  hasEmptyResults = computed(() => !this.loading() && !this.items().length);

  readonly destroyRef = inject(DestroyRef);
  readonly cdr = inject(ChangeDetectorRef);
  private getFormControlDebounced$ = () =>
    this.formControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged());
  private getSearchQuery$ = () =>
    this.getFormControlDebounced$().pipe(
      filter(value => typeof value === 'string'),
      tap(value => this.onSearch(value)),
    );
  private originValidators: ValidatorFn | null = null;

  constructor() {
    const ngControl = inject(NgControl, { optional: true, self: true });
    const elementRef = inject(ElementRef<HTMLElement>);
    if (!ngControl) return;
    super(ngControl, elementRef);

    effect(() => {
      if (!this.opened()) return;
      this.refreshViewport();
    });

    effect(() => {
      if (this.loading() && this.displayedItems().length) return;
      this.displayedItems.set(this.itemsEnriched());
    });

    effect(() => {
      const currentItems = this.items();
      if (!currentItems.length) return;
      if (!this.formControl) return;
      if (!this.selectedValue()) return;
      this.formControl.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.originValidators = this.formControl.validator;
    this.formControl.valueChanges
      .pipe(
        tap(value => this.selectedValue.set(value)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.formControl.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.errorState = this.formControl.invalid && this.formControl.touched;
    });
    if (this.disableSearch()) return;
    this.getSearchQuery$().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  private refreshViewport() {
    if (!this.cdkVirtualScrollViewPort()) return;
    this.cdkVirtualScrollViewPort()?.scrollToIndex(0);
    this.cdkVirtualScrollViewPort()?.checkViewportSize();
    this.previousScrollIndex.set(0);
  }

  onScroll(index: number): void {
    if (!this.hasMore()) return;
    if (this.loading()) return;
    if (!this.displayedItems().length) return;
    if (this.hasEmptyResults()) return;
    const scrollingBackwards = this.previousScrollIndex() >= index;
    if (scrollingBackwards) return;
    this.previousScrollIndex.set(index);
    const scrollPercentage = ((index + this.itemsInDropdown()) / this.displayedItems().length) * 100;
    if (scrollPercentage < this.scrollThreshold()) return;
    this.loadMore.emit();
  }

  autocompleteTrigger = viewChild(MatAutocompleteTrigger);
  inputElRef = viewChild('inputEl', { read: ElementRef });

  onExpand(): void {
    if (this.formControl.disabled) {
      return;
    }
    if (this.autocompleteTrigger()?.panelOpen) {
      this.autocompleteTrigger()?.closePanel();
      return;
    }
    this.inputElRef()?.nativeElement.focus();
    // triggers outside Angular zone
    requestAnimationFrame(() => this.autocompleteTrigger()?.openPanel());
  }

  ngAfterViewInit(): void {
    const trigger = this.autocompleteTrigger();
    if (!trigger) return;
    this.positionUtil.patchTriggerPositioning(trigger);
  }

  trackById = (_: number, item: T) => item?.id;

  /**
   * Handles the selection of an item from the dropdown.
   * CAVEAT! This is intentional overlap with what mat-option's [[optionSelected] input](https://v20.material.angular.dev/components/autocomplete/api) does,
   * as we conciously block the default behavior of mat-option to achieve our custom selection handling, e.g. to handle multi-selection.
   *
   * @param item The item that was selected.
   * @param event The mouse event triggered by the selection.
   */
  // onOptionSelected(item: T, event: MouseEvent): void {
  //   event.stopPropagation();
  //   if (!item.disabled) {
  //     return;
  //   }
  //   this.formControl.setValue(item);
  //   const trigger = this.autocompleteTrigger();
  //   if (trigger && !trigger.panelOpen) trigger.openPanel();
  //   this.cdr.markForCheck();
  // }

  private onSearch(query: string) {
    // temporarily remove validators to allow search to be triggered,
    // this is to allow search to be triggered when the form control is invalid,
    // e.g. due to the search query that couldn't be found
    const currentValidators = this.formControl.validator;
    this.formControl.setValidators(this.originValidators);
    this.formControl.updateValueAndValidity({ emitEvent: false });
    if (query && !this.formControl.valid) {
      this.formControl.setValidators(currentValidators);
      this.formControl.updateValueAndValidity({ emitEvent: false });
      return;
    }
    this.searched.emit(query);
    this.formControl.setValidators(currentValidators);
    this.formControl.updateValueAndValidity({ emitEvent: false });
  }

  override writeValue(value: T): void {
    super.writeValue(value);
    this.selectedValue.set(value);
  }
}
