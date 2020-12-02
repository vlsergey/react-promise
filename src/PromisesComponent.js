// @flow

import * as memoize from './memoize';
import { boundMethod } from 'autobind-decorator';
import { PureComponent } from 'react';
import shallowCompare from './shallowCompare';

type PropsType = {
  children : { [string] : ?any } => any,
  cleanOnChange? : ?boolean,
  promises? : { [string] : Promise< any >},
};

type StateType = {
  error : ?any,
  errors : { [string ] : ?any },
  values : { [string ] : ?any },
};

export default class PromisesComponent
  extends PureComponent<PropsType, StateType> {

  _isMounted : boolean;
  _prevPromises : ?{ [string] : Promise< any >};

  constructor() {
    super( ...arguments );
    this.state = {
      error: null,
      errors: {},
      values: {},
    };

    this._isMounted = false;
    this._prevPromises = null;
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
  cleanValues( ) {
    this.resetValues();
  }

  @boundMethod
  setValue( key : string, value : any ) {
    /* eslint react/no-direct-mutation-state: 0 */
    if ( this._isMounted ) {
      this.setState( state => ( {
        values: { ...state.values, [ key ]: value },
      } ) );
    } else {
      this.state = { ...this.state, values: { ...this.state.values, [ key ]: value } };
    }
  }

  @boundMethod
  resetValues( ) {
    /* eslint react/no-direct-mutation-state: 0 */
    if ( this._isMounted ) {
      this.setState( { error: null, errors: {}, values: {} } );
    } else {
      this.state = { ...this.state, error: null, errors: {}, values: {} };
    }
  }

  subscribe() {
    const { cleanOnChange, promises } = this.props;
    if ( shallowCompare( this._prevPromises, promises ) ) {
      return;
    }
    if ( cleanOnChange ) this.resetValues();
    this._prevPromises = promises;

    if ( promises === null || promises === undefined ) return;
    Object.keys( promises ).forEach( ( key : string ) => {
      const promise : Promise< any > = promises[ key ];

      const cachedResult = memoize.find( promise );
      if ( cachedResult ) this.setValue( key, cachedResult );

      promise
        .then( value => {
          memoize.set( promise, value );
          if ( this._prevPromises === promises ) {
            this.setValue( key, value );
          }
        } )
        .catch( error => {
          if ( this._prevPromises === promises ) {
            this.setState( state => ( {
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

  unsubscribe( ) {
    if ( this._prevPromises !== null ) {
      this._prevPromises = null;
    }
  }

  render() : any {
    const { children } = this.props;
    const { error, values } = this.state;
    if ( error !== null ) {
      throw error;
    }
    return children( values );
  }
}
