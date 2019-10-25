### Promises components for ReactJS

Simple ReactJS components for Promise calculation.

[![Build Status](https://travis-ci.org/vlsergey/react-promise.svg?branch=master)](https://travis-ci.org/vlsergey/react-promise)

```javascript
import { PromiseComponent, PromisesComponent } from "@vlsergey/react-promise";
/* ... */
const promise
return <PromiseComponent
    fallback={<span>Calculating...</span>}
	promise={ promise }>
		{(data) => <span>Promise result: {JSON.stringify(data)}}</span>}
</PromiseComponent>;

/* ... */
const multiplePromises = {
	promise1: Promise.resolve("First promise result"),
	promise2: new Promise( (resolve, reject) => { /*...*/ } ),
};
return <PromisesComponent
	promises={ multiplePromises }>
		{(data) => <ul>
			<li>First promise result: {JSON.stringify(data.promise1)}}</li>
			<li>Second promise result: {JSON.stringify(data.promise2)}}</li>
		</ul>		}
</PromiseComponent>;
```

#### Important notice
* One shall not create new promise in `render()` method of component. Promise shall be created in `componentDidMount()` method of component. Another way is to use memoize function in `render()` method:

```javascript
import memoizeOne from "memoizeOne";
import {PromiseComponent} from "@vlsergey/react-promise";

class MyComponent extends PureComponent {
	constructor() {
		super(...arguments);
		this.promiseFactory = memoizeOne(  (arg1, arg2) => new Promise( /*...*/ )  );
	}

	render() {
		const { arg1, arg2 } = this.props;
		const promise = this.promiseFactory( arg1, arg2 );
		return <PromiseComponent promise={promise}>/*...*/</PromiseComponent>;
	}
}
```