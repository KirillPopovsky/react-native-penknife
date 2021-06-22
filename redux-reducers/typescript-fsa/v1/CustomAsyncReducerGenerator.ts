import {AsyncActionCreators} from "typescript-fsa";
import {reducerWithInitialState} from "typescript-fsa-reducers";
import {IHandlersConfig, ReducerType} from "./ReducersCommon";
import {actionCreator} from "../actionCreator";

export class CustomAsyncReducerGenerator {
  static getInitialState<TState>(initValue: TState): TState {
    return initValue;
  }

  static getAction<TParams, TResult>(actionName: string): AsyncActionCreators<TParams, TResult, Error> {
    return actionCreator.async<TParams, TResult, Error>(actionName);
  }

  static getReducer<TParams, TResult, TState>(
    action: AsyncActionCreators<TParams, TResult, Error>,
    initialState: TState,
    handlers: Required<IHandlersConfig<TParams, TResult, TState>>): ReducerType {

    const reducer = reducerWithInitialState(initialState)
      .case(action.started, handlers.onStart)
      .case(action.done, handlers.onDone)
      .case(action.failed, handlers.onFail)
      .build();

    return reducer;
  }
}
