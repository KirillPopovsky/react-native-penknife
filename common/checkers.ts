export const hasValue = <T>(value?: T): value is T => value !== null && value !== undefined;

export function notNull<T>(item: T | null | undefined): T {
  if (item == null) {
    throw new Error("Object can not be null.");
  } else {
    return item;
  }
}