export type LabelledItem = {
  id: string;
  label: string;
};

export type LabelledSelectableItem = LabelledItem & {
  isSelected: boolean;
  disabled?: boolean;
};

export type DisplayFn<T extends LabelledItem | LabelledSelectableItem, K> = ((value: T) => string) | K;