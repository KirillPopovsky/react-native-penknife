import {actionCreator} from "../actionCreator";
import {Handler, ReducerBuilder, reducerWithInitialState} from "typescript-fsa-reducers";
import {ActionCreator} from "typescript-fsa";
import {ReducerType} from "./ReducersCommon";
import {newState} from "../../../common/utils/newState";

/*
on >> State = Result
*/

export class SimpleSyncReducerGenerator {
  static getInitialState<TState>(initValue: TState): TState {
    return initValue;
  }

  static getAction<TState>(actionName: string): ActionCreator<TState> {
    return actionCreator<TState>(actionName);
  }

  static getReducers<TState>(
    initialState: TState,
    reducersConfigs: {
      action: ActionCreator<TState> | ActionCreator<void>,
      handler?: Handler<TState, TState, any>,
    }[],
    builder?: ReducerBuilder<TState>,
  ): ReducerType {
    return SimpleSyncReducerGenerator.getReducersBuilder(initialState, reducersConfigs, builder).build();
  }

  static getReducersBuilder<TState>(
    initialState: TState,
    reducersConfigs: {
      action: ActionCreator<TState> | ActionCreator<void>,
      handler?: Handler<TState, TState, any>,
    }[],
    builder?: ReducerBuilder<TState>,
  ): ReducerBuilder<TState> {
    const mainBuilder = builder ?? reducerWithInitialState(initialState);

    return reducersConfigs.reduce((_builder, config) => {
      return SimpleSyncReducerGenerator.getReducerBuilder(
        initialState, config.action, config.handler, _builder,
      );
    }, mainBuilder);
  }

  static getReducerBuilder<TState>(
    initialState: TState,
    action: ActionCreator<TState> | ActionCreator<void>,
    handler?: Handler<TState, TState, any>,
    builder?: ReducerBuilder<TState>,
  ): ReducerBuilder<TState> {

    const defaultHandler: Handler<TState, TState, any> = (state: TState, payload: TState) => {
      return typeof payload == "object" ? newState<TState>(state, payload) : payload;
    };
    const _handler = (handler ?? defaultHandler);

    const reducer = (builder ?? reducerWithInitialState(initialState))
      .case(action, _handler);

    return reducer;
  }

  static getReducer<TState>(
    initialState: TState, action: ActionCreator<TState>, handler?: Handler<TState, TState, any>): ReducerType {

    return SimpleSyncReducerGenerator.getReducerBuilder(initialState, action, handler).build();
  }
}
