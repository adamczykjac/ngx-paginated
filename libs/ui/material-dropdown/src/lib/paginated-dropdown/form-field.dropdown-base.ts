import { Directive, ElementRef, inject, Input, input, OnDestroy, Optional, Self } from '@angular/core';
import { Subject } from 'rxjs';
import { FocusMonitor } from '@angular/cdk/a11y';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { DisplayFn } from '../models/display-fn';

const DEFAULT_QUERY_KEYS = ['label'];

@Directive()
export class FormFieldDropdownBase<T extends { id: string; label: string }>
  implements ControlValueAccessor, MatFormFieldControl<T>, OnDestroy
{
  static nextId = 0;
  private _value: T | null = null;

  onChange: (value: T) => void = () => {};
  onTouched: () => void = () => {};

  readonly _focusMonitor = inject(FocusMonitor);
  readonly stateChanges = new Subject<void>();

  @Input() placeholder = '';
  /**
   * The id of the dropdown.
   */
  id = `ngx-dropdown-${FormFieldDropdownBase.nextId++}`;
  /**
   * Object keys leading to values which query should search against.
   */
  @Input() queryKeys? = DEFAULT_QUERY_KEYS;

  focused = false;
  empty = false;
  required = false;
  disabled = false;
  errorState = false;
  loading = input<boolean>(false);
  items = input<T[]>([]);

  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  /**
   * Function to display the input value triggering the autocomplete dropdown.
   */
  @Input() displayInputWith: DisplayFn<T, null> = (value: T) => value?.label;
  /**
   * Function to display the option value.
   */
  @Input() displayOptionWith: DisplayFn<T, null> = (value: T) => value?.label;

  onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this._elementRef.nativeElement.querySelector('input')?.focus();
    }
  }

  constructor(@Optional() @Self() public ngControl: NgControl, protected _elementRef: ElementRef<HTMLElement>) {
    if (this.ngControl == null) return;
    this.ngControl.valueAccessor = this;
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  get value(): T {
    return this._value || this.ngControl?.value;
  }
  set value(value: T) {
    this._value = value;
    this.onChange(value);
    this.stateChanges.next();
  }

  setDescribedByIds(ids: string[]): void {
    // Not needed for this implementation
  }

  get formControl() {
    return this.ngControl?.control as FormControl;
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: T): void {
    this._value = value;
    this.stateChanges.next();
  }
}
