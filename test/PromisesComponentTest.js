import { findRenderedDOMComponentWithClass, renderIntoDocument } from 'react-dom/test-utils';
import assert from 'assert';
import PromisesComponent from 'PromisesComponent';
import React from 'react';

const nextTick = () => new Promise( resolve => setTimeout( resolve, 0 ) );

describe( 'PromisesComponent', () => {

  it( 'can render on resolve', async() => {
    let myResolve1, myResolve2;
    const promise1 = new Promise( resolve => { myResolve1 = resolve; } );
    const promise2 = new Promise( resolve => { myResolve2 = resolve; } );

    const rendered = renderIntoDocument( <PromisesComponent
      promises={{ promise1, promise2 }}>
      {data => <div className="childClassName">
        {JSON.stringify( data )}
      </div>}
    </PromisesComponent> );
    assert.ok( rendered );

    // not yet resolved
    assert.equal( findRenderedDOMComponentWithClass( rendered, 'childClassName' ).innerText, '{}' );

    // Resolving first promise...
    myResolve1( 'resolved' );
    await nextTick();

    // Expecting first promise result to be rendered already...
    assert.equal( findRenderedDOMComponentWithClass( rendered, 'childClassName' ).innerText, '{"promise1":"resolved"}' );

    // Resolving second promise...
    myResolve2( 'resolved' );
    await nextTick();

    // Expecting second promise result to be rendered already...
    assert.equal( findRenderedDOMComponentWithClass( rendered, 'childClassName' ).innerText, '{"promise1":"resolved","promise2":"resolved"}' );
  } );

} );
