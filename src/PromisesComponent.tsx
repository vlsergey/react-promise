import * as memoize from './memoize';
import { PureComponent, ReactNode } from 'react';
import shallowCompare from './shallowCompare';

interface PropsType<T> {
  children : ( values : Record<string, T> ) => ReactNode;
  cleanOnChange? : boolean;
  promises? : Record<string, Promise< T >>;
}

interface StateType<T, E> {
  error : E | null,
  errors : Record<string, E>,
  values : Record<string, T>,
}

export default class PromisesComponent<T, E>
  extends PureComponent<PropsType<T>, StateType<T, E>> {

  _isMounted = false;
  _prevPromises : Record<string, Promise< T >> | null = null;

  state : StateType<T, E> = {
    error: null,
    errors: {},
    values: {},
  };

  constructor( props: PropsType<T> | Readonly<PropsType<T>> ) {
    super( props );
    this.subscribe();
  }

  componentDidMount() : void {
    this._isMounted = true;
    this.subscribe();
  }

  componentDidUpdate() : void {
    this.subscribe();
  }

  componentWillUnmount() : void {
    this.unsubscribe();
    this._isMounted = false;
  }

  cleanValues = () : void => {
    this.resetValues();
  }

  setValue = ( key : string, value : T ) : void => {
    /* eslint react/no-direct-mutation-state: 0 */
    if ( this._isMounted ) {
      this.setState( ( state : StateType<T, E> ) => ( {
        values: { ...state.values, [ key ]: value },
      } ) );
    } else {
      this.state = { ...this.state, values: { ...this.state.values, [ key ]: value } };
    }
  }

  resetValues = () : void => {
    /* eslint react/no-direct-mutation-state: 0 */
    if ( this._isMounted ) {
      this.setState( { error: null, errors: {}, values: {} } );
    } else {
      this.state = { ...this.state, error: null, errors: {}, values: {} };
    }
  }

  subscribe() : void {
    const { cleanOnChange, promises } = this.props;
    if ( shallowCompare( this._prevPromises, promises ) ) {
      return;
    }
    if ( cleanOnChange ) this.resetValues();
    this._prevPromises = promises;

    if ( promises === null || promises === undefined ) return;
    Object.keys( promises ).forEach( ( key : string ) => {
      const promise : Promise< T > = promises[ key ];

      const cachedResult : T = memoize.find( promise );
      if ( cachedResult ) this.setValue( key, cachedResult );

      promise
        .then( value => {
          memoize.set( promise, value );
          if ( this._prevPromises === promises ) {
            this.setValue( key, value );
          }
        } )
        .catch( ( error:E ) => {
          if ( this._prevPromises === promises ) {
            this.setState( ( state : StateType<T, E> ) => ( {
              error,
              errors: {
                ...state.errors,
                [ key ]: error,
              },
            } ) );
          }
        } );
    } );
  }

  unsubscribe() : void {
    if ( this._prevPromises !== null ) {
      this._prevPromises = null;
    }
  }

  render() : ReactNode {
    const { children } = this.props;
    const { error, values } = this.state;
    if ( error !== null ) {
      throw error;
    }
    return children( values );
  }
}
