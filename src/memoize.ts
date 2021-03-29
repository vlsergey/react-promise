/* eslint @typescript-eslint/no-misused-promises: 0 */

// i have no idea what eslint expects here...
// eslint-disable-next-line
const mySymbol = Symbol( '@vlsergey/react-promise: memoize promise result' );

interface PromiseAsBag<T> extends Promise<T> {
  [mySymbol]?: T;
}

export function find<T>( promise : Promise<T> | null | undefined ) : T | null | undefined {
  if ( !promise ) return null;
  const asBag : PromiseAsBag<T> = promise;
  return asBag[ mySymbol ];
}

export function set<T>( promise : Promise< T > | null | undefined, result : T | null | undefined ) : void {
  if ( !promise ) throw new Error( 'Missing promise argument' );
  const asBag : PromiseAsBag<T> = promise;
  asBag[ mySymbol ] = result;
}
