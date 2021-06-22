import {ActionCreator, AsyncActionCreators, Failure, Success} from "typescript-fsa";
import {IHandlersConfig, ReducerType} from "./ReducersCommon";
import {actionCreator} from "../actionCreator";
import {Handler, ReducerBuilder, reducerWithInitialState} from "typescript-fsa-reducers";
import {ILoadable, LoadState} from "../../../common/loadState";
import {assertNotNull} from "../../../common/assertNotNull";
import {newState} from "../../../common/utils/newState";

/*
start >> LoadState = Refreshing
done >> LoadState = Idle, State = Result
error >> LoadState = Error
*/

class Builder<TParams, TResult> {
  private builder: ReducerBuilder<ILoadable<TResult>>;
  private initialState: ILoadable<TResult>;

  constructor(initialState: ILoadable<TResult>) {
    this.builder = reducerWithInitialState(initialState);
    this.initialState = {...initialState};
  }

  public asyncCase(
    action: AsyncActionCreators<TParams, TResult, Error>,
    handlers?: IHandlersConfig<TParams, TResult, ILoadable<TResult>>)
    : Builder<TParams, TResult> {

    const defaultOnStartHandler = (state: ILoadable<TResult>): ILoadable<TResult> => ({
      content: state.content,
      loadState: LoadState.refreshing,
    });

    const defaultOnDoneHandler = (state: ILoadable<TResult>, {result}: Success<TParams, TResult>): ILoadable<TResult> => ({
      content: assertNotNull(result),
      loadState: LoadState.idle,
    });

    const defaultOnFailHandler = (state: ILoadable<TResult>, {}: Failure<TParams, Error>): ILoadable<TResult> => ({
      content: state.content,
      loadState: LoadState.error,
    });
    this.builder = this.builder
      .case(action.started, handlers?.onStart ?? defaultOnStartHandler)
      .case(action.done, handlers?.onDone ?? defaultOnDoneHandler)
      .case(action.failed, handlers?.onFail ?? defaultOnFailHandler);

    return this;
  }

  public case(
    action: ActionCreator<ILoadable<TResult>> | ActionCreator<void>,
    handler?: Handler<ILoadable<TResult>, ILoadable<TResult>, any>)
    : Builder<TParams, TResult> {
    const defaultHandler: Handler<ILoadable<TResult>, ILoadable<TResult>, any> = (state: ILoadable<TResult>, payload: ILoadable<TResult>) => {
      return typeof payload == "object" ? newState<ILoadable<TResult>>(state, payload) : payload;
    };
    const _handler = (handler ?? defaultHandler);
    this.builder = this.builder.case(action, _handler);

    return this;
  }

  public clear(action: ActionCreator<void>): Builder<TParams, TResult> {
    const defaultHandler: Handler<ILoadable<TResult>, ILoadable<TResult>, any> = (state: ILoadable<TResult>) => {
      return typeof this.initialState == "object" ? newState<ILoadable<TResult>>(state, this.initialState) : this.initialState;
    };
    this.builder = this.builder.case(action, defaultHandler);

    return this;
  }

  public build(): ReducerType {
    return this.builder.build();
  }
}

export class AsyncReducer {
  static initialState<TResult>(initValue: TResult): ILoadable<TResult> {
    return {
      loadState: LoadState.needLoad,
      content: initValue,
    };
  }

  static action<TParams, TResult>(actionName: string): AsyncActionCreators<TParams, TResult, Error> {
    return actionCreator.async<TParams, TResult, Error>(actionName);
  }

  static reducer<TParams, TResult>(initialState: ILoadable<TResult>): Builder<TParams, TResult> {
    return new Builder<TParams, TResult>(initialState);
  }
}
