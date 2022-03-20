import {PureComponent, ReactNode} from 'react';

import * as memoize from './memoize';
import shallowCompare from './shallowCompare';

type Deferred<Values> = {
  [Property in keyof Values]: Promise<Values[Property]>;
};

interface PropsType<Values, Result extends ReactNode> {
  children: (values: Partial<Values>) => Result;
  cleanOnChange?: boolean;
  promises?: Deferred<Values>;
}

interface StateType<Values> {
  error?: unknown;
  errors: {[Property in keyof Values]?: unknown};
  values: Partial<Values>;
}

export default class PromisesComponent<Values, Result extends ReactNode>
  extends PureComponent<PropsType<Values, Result>, StateType<Values>> {

  private mounted = false;
  private prevPromises?: Deferred<Values> = undefined;

  override state: StateType<Values> = {
    error: null,
    errors: {},
    values: {},
  };

  constructor (props: Readonly<PropsType<Values, Result>>) {
    super(props);

    this.subscribe();
  }

  override componentDidMount () {
    this.mounted = true;
    this.subscribe();
  }

  override componentDidUpdate () {
    this.subscribe();
  }

  override componentWillUnmount () {
    this.unsubscribe();
    this.mounted = false;
  }

  cleanValues = () => {
    this.resetValues();
  };

  setValue = <Key extends keyof Values>(key: Key, value: Values[Key]) => {
    if (this.mounted) {
      this.setState(state => ({
        values: {...state.values, [key]: value},
      }));
    } else {
      /* eslint-disable-next-line react/no-direct-mutation-state */
      this.state = {
        ...this.state,
        values: {...this.state.values, [key]: value},
      };
    }
  };

  resetValues = () => {
    if (this.mounted) {
      this.setState({
        error: null,
        errors: {},
        values: {},
      });
    } else {
      /* eslint-disable-next-line react/no-direct-mutation-state */
      this.state = {
        ...this.state,
        error: null,
        errors: {},
        values: {}
      };
    }
  };

  subscribe () {
    const {cleanOnChange, promises} = this.props;
    if (shallowCompare(this.prevPromises, promises)) {
      return;
    }

    if (cleanOnChange) this.resetValues();
    this.prevPromises = promises;

    if (promises === null || promises === undefined) return;
    for (const k of Object.keys(promises)) {
      const key = k as keyof Values;
      const promise = promises[key];

      const cachedResult = memoize.find(promise);
      if (cachedResult) this.setValue(key, cachedResult);

      promise
        .then(value => {
          memoize.set(promise, value);
          if (this.prevPromises === promises) {
            this.setValue(key, value);
          }
        })
        .catch((error: unknown) => {
          if (this.prevPromises === promises) {
            this.setState(state => ({
              error,
              errors: {
                ...state.errors,
                [key]: error,
              },
            }));
          }
        });
    }
  }

  unsubscribe () {
    this.prevPromises = undefined;
  }

  override render (): Result {
    const {children} = this.props;
    const {error, values} = this.state;
    if (error !== null) {
      throw error;
    }
    return children(values);
  }
}
