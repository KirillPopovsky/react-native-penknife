import {actionCreator} from "../actionCreator";
import {Handler, ReducerBuilder, reducerWithInitialState} from "typescript-fsa-reducers";
import {ActionCreator} from "typescript-fsa";
import {ReducerType} from "./ReducersCommon";
import {newState} from "../../../common/utils/newState";

/*
on >> State = Result
*/
class Builder<TState> {
  private builder: ReducerBuilder<TState>;
  private initialState: TState;

  constructor(initialState: TState) {
    this.builder = reducerWithInitialState(initialState);
    this.initialState = {...initialState};
  }

  public case(
    action: ActionCreator<TState>,
    handler?: Handler<TState, TState, any>)
    : Builder<TState> {

    const defaultHandler: Handler<TState, TState, any> = (state: TState, payload: TState) => {
      return typeof payload == "object" ? newState<TState>(state, payload) : payload;
    };
    const _handler = (handler ?? defaultHandler);
    this.builder = this.builder.case(action, _handler);

    return this;
  }

  public clear(action: ActionCreator<void>)
    : Builder<TState> {
    const defaultHandler: Handler<TState, TState, any> = (state: TState) => {
      return typeof this.initialState == "object" ? newState<TState>(state, this.initialState) : this.initialState;
    };
    this.builder = this.builder.case(action, defaultHandler);

    return this;
  }

  public build(): ReducerType {
    return this.builder.build();
  }
}

export class SyncReducer {
  static initialState<TState>(initValue: TState): TState {
    return initValue;
  }

  static action<TState>(actionName: string): ActionCreator<TState> {
    return actionCreator<TState>(actionName);
  }

  static reducer<TState>(
    initialState: TState,
  ): Builder<TState> {
    return new Builder<TState>(initialState);
  }
}
