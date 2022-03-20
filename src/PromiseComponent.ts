import {PureComponent} from 'react';

import * as memoize from './memoize';

interface PropsType<Value, Fallback extends React.ReactNode, Result extends React.ReactNode> {
  children: (value: Value) => Result;
  cleanOnChange?: boolean;
  fallback?: Fallback;
  promise?: Promise< Value >;
}

interface StateType<Value> {
  completed: boolean;
  error?: unknown;
  value?: Value;
}

export default class PromiseComponent<Value, Fallback extends React.ReactNode, Result extends React.ReactNode>
  extends PureComponent<PropsType<Value, Fallback, Result>, StateType<Value>> {

  mounted = false;
  prevPromise?: Promise< Value >;

  override state: StateType<Value> = {
    error: undefined,
    completed: false,
    value: undefined,
  };

  constructor (props: PropsType<Value, Fallback, Result>) {
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

  resetValue = () => {
    /* eslint react/no-direct-mutation-state: 0 */
    if (this.mounted) {
      this.setState({error: null, completed: false, value: undefined});
    } else {
      this.state = {...this.state, error: null, completed: false, value: undefined};
    }
  };

  setValue = (value: Value | undefined) => {
    if (this.mounted) {
      this.setState({error: null, completed: true, value});
    } else {
      /* eslint-disable-next-line react/no-direct-mutation-state */
      this.state = {...this.state, error: null, completed: true, value};
    }
  };

  subscribe () {
    const {cleanOnChange, promise} = this.props;
    if (this.prevPromise !== promise) {
      if (cleanOnChange) {
        this.resetValue();
      }
      this.prevPromise = promise;

      if (promise !== undefined && promise !== null) {
        const cachedResult = memoize.find(promise);
        if (cachedResult) this.setValue(cachedResult);

        promise.then(value => {
          // cache promise result
          memoize.set(promise, value);
          if (this.prevPromise === promise) {
            this.setValue(value);
          }
        })
          .catch((error: unknown) => {
            if (this.prevPromise === promise) {
              this.setState({error, completed: true, value: undefined});
            }
          });
      }
    }
  }

  unsubscribe () {
    this.prevPromise = undefined;
  }

  override render (): Fallback | Result | null {
    const {children, fallback} = this.props;
    const {error, completed, value} = this.state;

    if (!completed) {
      return fallback || null;
    }
    if (error !== null) {
      throw error;
    }
    return children(value as Value);
  }
}
