### Promises components for ReactJS

Simple ReactJS components for Promise calculation.

[![NPM version][npm-image]][npm-url]
[![Build Status][ci-image]][ci-url]
[![Downloads][downloads-image]][downloads-url]

#### Usage with single Promise
```javascript
import { PromiseComponent } from "@vlsergey/react-promise";
/* ... */
const promise
return <PromiseComponent
    fallback={<span>Calculating...</span>}
	promise={ promise }>
		{(data) => <span>Promise result: {JSON.stringify(data)}}</span>}
</PromiseComponent>;
```

#### Usage with multiple Promise's
```javascript
import { PromisesComponent } from "@vlsergey/react-promise";

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
import memoizeOne from "memoize-one";
import { PromiseComponent } from "@vlsergey/react-promise";

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

#### Changelog
Unspecified minor versions are for dependencies updates.

##### 4.0.0
* ⚡ Better TypeScript support in `PromisesComponent` (type safety for values)

##### 3.2.0
* 📦 Add hybrid CommonJS + ESM packaging.

##### 3.1.0
* Replace `autobind-decorator` with arrow function per @bradzacher advise in typescript-eslint/typescript-eslint#3245.

##### 3.0.0
* ⚡ Move from [flow](https://flow.org/) to [TypeScript](https://www.typescriptlang.org/).

##### 2.6.0
* 🐛 Support `null` and `undefined` as result of `Promise` (and let user decide what to do with it).

##### 2.2.0
* 🐎 Less rerendering in some cases (like already resolved `Promise` or shallow-same promises object in `PromisesComponent`)

##### 2.0.0
* 📦 Add [flow](https://flow.org/) type definitions to result package

##### 1.0.1
* 🎉 Initial version

[npm-image]: https://img.shields.io/npm/v/@vlsergey/react-promise.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@vlsergey/react-promise
[ci-image]: https://github.com/vlsergey/react-promise/actions/workflows/node.js.yml/badge.svg
[ci-url]: https://github.com/vlsergey/react-promise/actions/workflows/node.js.yml
[downloads-image]: http://img.shields.io/npm/dm/@vlsergey/react-promise.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/@vlsergey/react-promise
