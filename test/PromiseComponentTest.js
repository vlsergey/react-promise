import { findRenderedDOMComponentWithClass, renderIntoDocument } from 'react-dom/test-utils';
import assert from 'assert';
import PromiseComponent from 'PromiseComponent';
import React from 'react';

const nextTick = () => new Promise( resolve => setTimeout( resolve, 0 ) );

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

} );
