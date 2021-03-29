/* Based on https://stackoverflow.com/a/52323412/7813776 with additional checks
and small optimizations */
/* eslint @typescript-eslint/no-explicit-any: 0 */
export default function shallowCompare( this : void, obj1 : {[index: string]:any}, obj2 : {[index: string]:any} ) : boolean {
  if ( obj1 === undefined || obj2 === undefined ) return obj1 === undefined && obj2 === undefined;
  if ( obj1 === null || obj2 === null ) return obj1 === null && obj2 === null;
  if ( Object.keys( obj1 ).length !== Object.keys( obj2 ).length ) return false;

  return Object.keys( obj1 ).every( key =>
    Object.prototype.hasOwnProperty.call( obj2, key ) && obj1[ key ] === obj2[ key ] );
}
