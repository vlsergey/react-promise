// @flow

import { find, set } from './memoize';
import { PureComponent } from 'react';

type ValueType = any;

type PropsType = {
  children : ValueType => any,
  cleanOnChange? : ?boolean,
  fallback? : ?any,
  promise? : ?Promise< ValueType >,
};

type StateType = {
  error : ?any,
  value? : ?ValueType,
};

export default class PromiseComponent extends PureComponent<PropsType, StateType> {

  _isMounted : boolean;
  _prevPromise : ?Promise< ValueType >;

  constructor() {
    super( ...arguments );
    this.state = {
      error: null,
      value: null,
    };

    // $FlowFixMe
    this.setValue = this.setValue.bind( this );

    this._isMounted = false;
    this._prevPromise = null;
    this.subscribe();
  }

  componentDidMount() {
    this._isMounted = true;
    this.subscribe();
  }

  componentDidUpdate( ) {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
    this._isMounted = false;
  }

  setValue( value : ?ValueType ) {
    /* eslint react/no-direct-mutation-state: 0 */
    if ( this._isMounted ) {
      this.setState( { error: null, value } );
    } else {
      this.state = { ...this.state, error: null, value };
    }
  }

  subscribe() {
    const { cleanOnChange, promise } = this.props;
    if ( this._prevPromise !== promise ) {
      if ( cleanOnChange ) {
        this.setValue( null );
      }
      this._prevPromise = promise;

      if ( promise !== undefined && promise !== null ) {
        const cachedResult : ?ValueType = find( promise );
        if ( cachedResult ) this.setValue( cachedResult );

        promise.then( ( value : ?ValueType ) => {
          // cache promise result
          set( promise, value );
          if ( this._prevPromise === promise ) {
            this.setState( { error: null, value } );
          }
        } )
          .catch( error => {
            if ( this._prevPromise === promise ) {
              this.setState( { error, value: null } );
            }
          } );
      }
    }
  }

  unsubscribe( ) {
    if ( this._prevPromise !== null ) {
      this._prevPromise = null;
    }
  }

  render() : any {
    const { children, fallback } = this.props;
    const { error, value } = this.state;

    if ( error !== null ) {
      throw error;
    }
    if ( value === undefined || value === null ) {
      return fallback || null;
    }
    return children( value );
  }
}
