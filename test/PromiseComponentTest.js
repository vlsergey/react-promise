// @flow

import { findRenderedDOMComponentWithClass, renderIntoDocument } from 'react-dom/test-utils';
import React, { PureComponent } from 'react';
import assert from 'assert';
import PromiseComponent from 'PromiseComponent';

const nextTick = () => new Promise<any>( resolve => setTimeout( resolve, 0 ) );

class FallbackCounter extends PureComponent<void> {
  static renderCounter : number = 0;

  render() {
    FallbackCounter.renderCounter++;
    return <div className="fallbackClassName" />;
  }
}

type WrapperStateType = {
  promise : Promise< string >,
};

class Wrapper extends PureComponent<void, WrapperStateType> {

  state = {
    promise: Promise.resolve( 'initial' ),
  };

  passNewPromise( promise : Promise< string > ) : void {
    this.setState( { promise } );
  }

  render() {
    const promise : Promise< string > = this.state.promise;
    return <PromiseComponent
      fallback={<FallbackCounter />}
      promise={promise}>
      {data => <div className="childClassName">{data}</div>}
    </PromiseComponent>;
  }
}

describe( 'PromiseComponent', () => {

  it( 'can render on resolve', async() => {
    let myResolve;
    const promise = new Promise( resolve => {
      myResolve = resolve;
    } );

    const rendered = renderIntoDocument( <PromiseComponent
      fallback={<div className="fallbackClassName" />}
      promise={promise}>
      {() => <div className="childClassName" />}
    </PromiseComponent> );
    assert.ok( rendered );

    // not yet resolved
    assert.ok( findRenderedDOMComponentWithClass( rendered, 'fallbackClassName' ) );
    assert.throws( () => findRenderedDOMComponentWithClass( rendered, 'childClassName' ) );

    // Resolving test promise...
    myResolve( 'resolved' );
    await nextTick();

    // Expecting child to be rendered already...
    assert.throws( () => findRenderedDOMComponentWithClass( rendered, 'fallbackClassName' ) );
    assert.ok( findRenderedDOMComponentWithClass( rendered, 'childClassName' ) );
  } );

  // TODO: is there a way not to draw fallback at all in the case?
  it( 'will render fallback only once if promise is resolved already', async() => {
    const promise : Promise< string > = Promise.resolve( 'initial' );
    const prevFallbackRendered = FallbackCounter.renderCounter;
    const rendered = renderIntoDocument( <PromiseComponent
      fallback={<FallbackCounter />}
      promise={promise}>
      {data => <div className="childClassName">{data}</div>}
    </PromiseComponent> );

    assert.ok( rendered );
    await nextTick();
    assert.equal( 'initial', findRenderedDOMComponentWithClass( rendered, 'childClassName' ).innerHTML );
    assert.equal( FallbackCounter.renderCounter, prevFallbackRendered + 1 );
  } );

  it( 'will not rended fallback if promise was already rendered in another instance of PromiseComponent', async() => {
    const promise : Promise< string > = Promise.resolve( 'initial' );
    let prevFallbackRendered = FallbackCounter.renderCounter;
    const rendered1 = renderIntoDocument( <PromiseComponent
      fallback={<FallbackCounter />}
      promise={promise}>
      {data => <div className="childClassName">{data}</div>}
    </PromiseComponent> );

    assert.ok( rendered1 );
    await nextTick();
    assert.equal( 'initial', findRenderedDOMComponentWithClass( rendered1, 'childClassName' ).innerHTML );
    assert.equal( FallbackCounter.renderCounter, prevFallbackRendered + 1 );

    // render with same promise -- shall not lead to fallback render at all
    // since result is cached
    prevFallbackRendered = FallbackCounter.renderCounter;
    const rendered2 = renderIntoDocument( <PromiseComponent
      fallback={<FallbackCounter />}
      promise={promise}>
      {data => <div className="childClassName">{data}</div>}
    </PromiseComponent> );
    assert.ok( rendered2 );
    await nextTick();
    assert.equal( 'initial', findRenderedDOMComponentWithClass( rendered2, 'childClassName' ).innerHTML );
    assert.equal( FallbackCounter.renderCounter, prevFallbackRendered + 0 );
  } );

  it( 'Will not render fallback when promise replaced with immediatly resolved one', async() => {
    const rendered = renderIntoDocument( <Wrapper /> );
    assert.ok( rendered );
    await nextTick();
    assert.equal( 'initial', findRenderedDOMComponentWithClass( rendered, 'childClassName' ).innerHTML );

    const prevFallbackRendered = FallbackCounter.renderCounter;
    const anotherResolvedPromise = new Promise( resolve => { resolve( 'nextPromise' ); } );
    rendered.passNewPromise( anotherResolvedPromise );
    await nextTick();
    assert.equal( 'nextPromise', findRenderedDOMComponentWithClass( rendered, 'childClassName' ).innerHTML );
    assert.equal( FallbackCounter.renderCounter, prevFallbackRendered );
  } );
} );
