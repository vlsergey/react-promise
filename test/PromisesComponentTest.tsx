import { findRenderedDOMComponentWithClass, renderIntoDocument } from 'react-dom/test-utils';
import { assert } from 'chai';
import PromisesComponent from '../src/PromisesComponent';
import React from 'react';

const nextTick = () => new Promise( resolve => setTimeout( resolve, 0 ) );

describe( 'PromisesComponent', () => {

  it( 'can render on resolve', async() => {
    let myResolve1 : ( result : string ) => void;
    let myResolve2 : ( result : string ) => void;

    const promise1 = new Promise<string>( resolve => { myResolve1 = resolve; } );
    const promise2 = new Promise<string>( resolve => { myResolve2 = resolve; } );

    const rendered = renderIntoDocument( <PromisesComponent
      promises={{ promise1, promise2 }}>
      {data => <div className="childClassName">
        {JSON.stringify( data )}
      </div>}
    </PromisesComponent> ) as unknown as PromisesComponent<string, unknown>;
    assert.ok( rendered );

    // not yet resolved
    assert.equal( findRenderedDOMComponentWithClass( rendered, 'childClassName' ).textContent, '{}' );

    // Resolving first promise...
    myResolve1( 'resolved' );
    await nextTick();

    // Expecting first promise result to be rendered already...
    assert.equal( findRenderedDOMComponentWithClass( rendered, 'childClassName' ).textContent, '{"promise1":"resolved"}' );

    // Resolving second promise...
    myResolve2( 'resolved' );
    await nextTick();

    // Expecting second promise result to be rendered already...
    assert.equal( findRenderedDOMComponentWithClass( rendered, 'childClassName' ).textContent, '{"promise1":"resolved","promise2":"resolved"}' );
  } );

} );
