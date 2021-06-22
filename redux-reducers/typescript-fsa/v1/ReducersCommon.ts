import {CombinedState, combineReducers, Reducer} from "redux";
import {Reducers} from "../Reducers";
import {Failure, Success} from "typescript-fsa";

export function getCompleteReducer<State>(reducers: Reducers<State>): Reducer<CombinedState<State>> {
  return combineReducers(reducers);
}

export type ReducerType = (state: any | undefined, action: {
  type: any;
}) => any;

export interface IHandlersConfig<TParams, TResult, TState> {
  onStart?: (state: TState, params: TParams) => TState;
  onDone?: (state: TState, success: Success<TParams, TResult>) => TState;
  onFail?: (state: TState, failure: Failure<TParams, Error>) => TState;
}
