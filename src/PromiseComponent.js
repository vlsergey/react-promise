// @flow

import * as memoize from './memoize';
import { boundMethod } from 'autobind-decorator';
import { PureComponent } from 'react';

type ValueType = any;

type PropsType = {
  children : ValueType => any,
  cleanOnChange? : ?boolean,
  fallback? : ?any,
  promise? : ?Promise< ValueType >,
};

type StateType = {
  completed : boolean,
  error : ?any,
  value? : ?ValueType,
};

export default class PromiseComponent extends PureComponent<PropsType, StateType> {

  _isMounted : boolean = false;
  _prevPromise : ?Promise< ValueType > = null;

  state : StateType = {
    error: null,
    completed: false,
    value: null,
  };

  constructor() {
    super( ...arguments );
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

  @boundMethod
  resetValue() {
    /* eslint react/no-direct-mutation-state: 0 */
    if ( this._isMounted ) {
      this.setState( { error: null, completed: false, value: undefined } );
    } else {
      this.state = { ...this.state, error: null, completed: false, value: undefined };
    }
  }

  @boundMethod
  setValue( value : ?ValueType ) {
    /* eslint react/no-direct-mutation-state: 0 */
    if ( this._isMounted ) {
      this.setState( { error: null, completed: true, value } );
    } else {
      this.state = { ...this.state, error: null, completed: true, value };
    }
  }

  subscribe() {
    const { cleanOnChange, promise } = this.props;
    if ( this._prevPromise !== promise ) {
      if ( cleanOnChange ) {
        this.resetValue();
      }
      this._prevPromise = promise;

      if ( promise !== undefined && promise !== null ) {
        const cachedResult : ?ValueType = memoize.find( promise );
        if ( cachedResult ) this.setValue( cachedResult );

        promise.then( ( value : ?ValueType ) => {
          // cache promise result
          memoize.set( promise, value );
          if ( this._prevPromise === promise ) {
            this.setValue( value );
          }
        } )
          .catch( error => {
            if ( this._prevPromise === promise ) {
              this.setState( { error, completed: true, value: null } );
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
