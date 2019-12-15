// @flow

import { find, set } from './memoize';
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

  isMounted : boolean;
  prevPromises : ?{ [string] : Promise< any >};

  constructor() {
    super( ...arguments );
    this.state = {
      error: null,
      errors: {},
      values: {},
    };

    // $FlowFixMe
    this.cleanValues = this.cleanValues.bind( this );
    // $FlowFixMe
    this.setValue = this.setValue.bind( this );

    this.isMounted = false;
    this.prevPromises = null;
    this.subscribe();
  }

  componentDidMount() {
    this.isMounted = true;
    this.subscribe();
  }

  componentDidUpdate( ) {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.isMounted = false;
  }

  cleanValues( ) {
    /* eslint react/no-direct-mutation-state: 0 */
    if ( this.isMounted ) {
      this.setState( { error: null, errors: {}, values: {} } );
    } else {
      this.state = { ...this.state, error: null, errors: {}, values: {} };
    }
  }

  setValue( key : string, value : any ) {
    /* eslint react/no-direct-mutation-state: 0 */
    if ( this.isMounted ) {
      this.setState( state => ( {
        values: { ...state.values, [ key ]: value },
      } ) );
    } else {
      this.state = { ...this.state, values: { ...this.state.values, [ key ]: value } };
    }
  }

  subscribe() {
    const { cleanOnChange, promises } = this.props;
    if ( shallowCompare( this.prevPromises, promises ) ) {
      return;
    }
    if ( cleanOnChange ) this.cleanValues();
    this.prevPromises = promises;

    if ( promises === null || promises === undefined ) return;
    Object.keys( promises ).forEach( ( key : string ) => {
      const promise : Promise< any > = promises[ key ];

      const cachedResult = find( promise );
      if ( cachedResult ) this.setValue( key, cachedResult );

      promise
        .then( value => {
          set( promise, value );
          if ( this.prevPromises === promises ) {
            this.setValue( key, value );
          }
        } )
        .catch( error => {
          if ( this.prevPromises === promises ) {
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
    if ( this.prevPromises !== null ) {
      this.prevPromises = null;
    }
  }

  render() {
    const { children } = this.props;
    const { error, values } = this.state;
    if ( error !== null ) {
      throw error;
    }
    return children( values );
  }
}
