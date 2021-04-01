import * as memoize from './memoize';
import { PureComponent, ReactNode } from 'react';

interface PropsType<T> {
  children : ( value : T ) => ReactNode;
  cleanOnChange? : boolean;
  fallback? : ReactNode;
  promise? : Promise< T >;
}

interface StateType<T, E> {
  completed : boolean;
  error : E | null;
  value : T | null;
}

export default class PromiseComponent<T, E> extends PureComponent<PropsType<T>, StateType<T, E>> {

  _isMounted = false;
  _prevPromise : Promise<T> | null = null;

  state : StateType<T, E> = {
    error: null,
    completed: false,
    value: null,
  };

  constructor( props: PropsType<T> | Readonly<PropsType<T>> ) {
    super( props );
    this.subscribe();
  }

  componentDidMount() : void {
    this._isMounted = true;
    this.subscribe();
  }

  public componentDidUpdate( ) : void {
    this.subscribe();
  }

  componentWillUnmount() : void {
    this.unsubscribe();
    this._isMounted = false;
  }

  resetValue = () : void => {
    /* eslint react/no-direct-mutation-state: 0 */
    if ( this._isMounted ) {
      this.setState( { error: null, completed: false, value: undefined } );
    } else {
      this.state = { ...this.state, error: null, completed: false, value: undefined };
    }
  }

  setValue = ( value : T | null | undefined ) : void => {
    /* eslint react/no-direct-mutation-state: 0 */
    if ( this._isMounted ) {
      this.setState( { error: null, completed: true, value } );
    } else {
      this.state = { ...this.state, error: null, completed: true, value };
    }
  }

  subscribe() : void {
    const { cleanOnChange, promise } = this.props;
    if ( this._prevPromise !== promise ) {
      if ( cleanOnChange ) {
        this.resetValue();
      }
      this._prevPromise = promise;

      if ( promise !== undefined && promise !== null ) {
        const cachedResult : T | null | undefined = memoize.find( promise );
        if ( cachedResult ) this.setValue( cachedResult );

        promise.then( ( value : T | null | undefined ) => {
          // cache promise result
          memoize.set( promise, value );
          if ( this._prevPromise === promise ) {
            this.setValue( value );
          }
        } )
          .catch( ( error : E ) => {
            if ( this._prevPromise === promise ) {
              this.setState( { error, completed: true, value: null } );
            }
          } );
      }
    }
  }

  unsubscribe( ) : void {
    if ( this._prevPromise !== null ) {
      this._prevPromise = null;
    }
  }

  render() : ReactNode {
    const { children, fallback } = this.props;
    const { error, completed, value } = this.state;

    if ( !completed ) {
      return fallback || null;
    }
    if ( error !== null ) {
      throw error;
    }
    return children( value );
  }
}
