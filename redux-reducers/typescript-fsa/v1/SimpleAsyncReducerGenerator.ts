import {ActionCreator, AsyncActionCreators, Failure, Success} from "typescript-fsa";
import {IHandlersConfig, ReducerType} from "./ReducersCommon";
import {actionCreator} from "../actionCreator";
import {Handler, ReducerBuilder, reducerWithInitialState} from "typescript-fsa-reducers";
import {ILoadable, LoadState} from "../../../common/loadState";
import {assertNotNull} from "../../../common/assertNotNull";
import {SimpleSyncReducerGenerator} from "./SimpleSyncReducerGenerator";

/*
start >> LoadState = Refreshing
done >> LoadState = Idle, State = Result
error >> LoadState = Error
*/

export class SimpleAsyncReducerGenerator {
  static getInitialState<TResult>(initValue: TResult): ILoadable<TResult> {
    return {
      loadState: LoadState.needLoad,
      content: initValue,
    };
  }

  static getAction<TParams, TResult>(actionName: string): AsyncActionCreators<TParams, TResult, Error> {
    return actionCreator.async<TParams, TResult, Error>(actionName);
  }

  static getReducer<TParams, TResult>(
    initialState: ILoadable<TResult>,
    action: AsyncActionCreators<TParams, TResult, Error>,
    handlers?: IHandlersConfig<TParams, TResult, ILoadable<TResult>>,
    builder?: ReducerBuilder<ILoadable<TResult>>,
  ): ReducerType {
    return SimpleAsyncReducerGenerator.getReducerBuilder(initialState, action, handlers, builder).build();
  }

  static getReducers<TParams, TResult>(
    initialState: ILoadable<TResult>,
    asyncHandlers: {
      action: AsyncActionCreators<TParams, TResult, Error>,
      handlers?: IHandlersConfig<TParams, TResult, ILoadable<TResult>>,
    }[],
    syncHandlers?: {
      action: ActionCreator<ILoadable<TResult>> | ActionCreator<void>,
      handler?: Handler<ILoadable<TResult>, ILoadable<TResult>, any>,
    }[],
    builder?: ReducerBuilder<ILoadable<TResult>>,
  ): ReducerType {
    return SimpleAsyncReducerGenerator.getReducersBuilder(initialState, asyncHandlers, syncHandlers, builder).build();
  }

  static getReducersBuilder<TParams, TResult>(
    initialState: ILoadable<TResult>,
    asyncHandlers: {
      action: AsyncActionCreators<TParams, TResult, Error>,
      handlers?: IHandlersConfig<TParams, TResult, ILoadable<TResult>>,
    }[],
    syncHandlers?: {
      action: ActionCreator<ILoadable<TResult>> | ActionCreator<void>,
      handler?: Handler<ILoadable<TResult>, ILoadable<TResult>, any>,
    }[],
    builder?: ReducerBuilder<ILoadable<TResult>>,
  ): ReducerBuilder<ILoadable<TResult>> {
    let mainBuilder = builder ?? reducerWithInitialState(initialState);

    mainBuilder = asyncHandlers.reduce((_builder, config) => {
      return SimpleAsyncReducerGenerator.getReducerBuilder(
        initialState, config.action, config.handlers, _builder,
      );
    }, mainBuilder);

    mainBuilder = syncHandlers && syncHandlers.reduce((_builder, config) => {
      return SimpleSyncReducerGenerator.getReducerBuilder(
        initialState, config.action, config.handler, _builder,
      );
    }, mainBuilder) || mainBuilder;

    return mainBuilder;
  }

  static getReducerBuilder<TParams, TResult>(
    initialState: ILoadable<TResult>,
    action: AsyncActionCreators<TParams, TResult, Error>,
    handlers?: IHandlersConfig<TParams, TResult, ILoadable<TResult>>,
    builder?: ReducerBuilder<ILoadable<TResult>>,
  ): ReducerBuilder<ILoadable<TResult>> {

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

    const reducer = (builder ?? reducerWithInitialState(initialState))
      .case(action.started, handlers?.onStart ?? defaultOnStartHandler)
      .case(action.done, handlers?.onDone ?? defaultOnDoneHandler)
      .case(action.failed, handlers?.onFail ?? defaultOnFailHandler);

    return reducer;
  }
}
