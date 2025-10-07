/**
 * The data model for the autocomplete.
 * For searching the options of the input we really just need the label.
 * This is also used for display.
 * The Data you want to use with the autocomplete component just needs to define a label as well.
 * Then typescript will allow it even if your data will hold more attributes than the label.
 * This is basically the minimum the component needs.
 */
export interface AutocompleteDataModel {
  /**
   * Label
   */
  label: string;
}
