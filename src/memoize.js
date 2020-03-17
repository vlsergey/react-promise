// @flow

const symbol = Symbol( '@vlsergey/react-promise: memoize promise result' );

export function find<T>( promise : ?Promise< T > ) : ?T {
  if ( !promise ) return null;
  // $FlowFixMe
  return promise[ symbol ];
}

export function set<T>( promise : Promise< T >, result : ?T ) : void {
  if ( !promise ) throw new Error( 'Missing promise argument' );
  // $FlowFixMe
  promise[ symbol ] = result;
}
