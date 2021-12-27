export const throwIfNull = <T>(messageSupplier?: () => string) => (
  value: T | null | undefined
): T => {
  if (value !== undefined && value !== null) return value;
  if (messageSupplier) throw new Error(messageSupplier());
  throw new Error("Expected value to be defined and non null");
};

// accepts null as a value
export const throwIfUndefined = <T>(messageSupplier?: () => string) => (
  value: T | undefined
): T => {
  if (value !== undefined) return value;
  if (messageSupplier) throw new Error(messageSupplier());
  throw new Error("Expected value to be defined");
};
