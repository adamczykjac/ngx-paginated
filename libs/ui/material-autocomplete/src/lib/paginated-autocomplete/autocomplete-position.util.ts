import { ElementRef } from '@angular/core';
import { OverlayPositionBuilder } from '@angular/cdk/overlay';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

export class AutocompletePositionUtil {
  constructor(private positionBuilder: OverlayPositionBuilder, private hostElement: ElementRef<HTMLElement>) {}

  /**
   * Sets custom position strategy for autocomplete overlay to attach to mat-form-field wrapper
   * @description This is a workaround to fix the issue where the autocomplete overlay (aka autocomplete panel),
   * is not positioned correctly when placing a autocomplete (that implements MatFormFieldControl) inside a MatFormField.
   * @param trigger The MatAutocomplete trigger instance
   */
  setCustomPositionStrategy(trigger: MatAutocompleteTrigger): void {
    const triggerAny = trigger as any;
    const overlay = triggerAny._overlayRef;

    if (!overlay || !overlay._positionStrategy) return;

    const matFormField = this.hostElement.nativeElement.closest('mat-form-field');
    const textFieldWrapper = matFormField?.querySelector('.mat-mdc-text-field-wrapper');
    if (!textFieldWrapper) return;
    const positionStrategy = this.positionBuilder
      .flexibleConnectedTo(textFieldWrapper)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: 0,
          offsetY: 0,
        },
      ])
      .withPush(false);

    overlay.updatePositionStrategy(positionStrategy);
    overlay.updateSize({ width: textFieldWrapper.getBoundingClientRect().width });
  }

  /**
   * Patches the autocomplete trigger to use custom positioning
   * @param trigger The autocomplete trigger instance
   */
  patchTriggerPositioning(trigger: MatAutocompleteTrigger): void {
    if (!trigger) return;

    // Override the method that gets called when panel opens
    const originalAttachOverlay = (trigger as any)._attachOverlay.bind(trigger);
    (trigger as any)._attachOverlay = () => {
      originalAttachOverlay();
      this.setCustomPositionStrategy(trigger);
    };
  }
}
