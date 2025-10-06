export function signal<T>(initial: T) {
  let current = initial;
  const getter: any = () => current;
  getter.set = (v: T) => {
    current = v;
  };
  return getter as (() => T) & { set: (v: T) => void };
}

export function computed<T>(fn: () => T) {
  return fn;
}
