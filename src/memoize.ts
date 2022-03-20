const SYMBOL: unique symbol = Symbol('@vlsergey/react-promise: memoize promise result');

interface SymbolHolder {
  [SYMBOL]: unknown;
}

export function find<T> (promise: Promise< T >): T | undefined {
  return (promise as unknown as SymbolHolder)[SYMBOL] as T | undefined;
}

export function set<T> (promise: Promise< T >, result: T | undefined): void {
  (promise as unknown as SymbolHolder)[SYMBOL] = result;
}
