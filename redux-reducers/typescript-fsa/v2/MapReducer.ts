import {ActionCreator, AsyncActionCreators, Failure, Success} from "typescript-fsa";
import {IHandlersConfig, ReducerType} from "./ReducersCommon";
import {actionCreator} from "../actionCreator";
import {Handler, ReducerBuilder, reducerWithInitialState} from "typescript-fsa-reducers";
import {LoadState} from "../../../common/loadState";
import {newState} from "../../../common/utils/newState";
import {IDict} from "../../../common/interfaces";

class Builder<MapItem> {
  private builder: ReducerBuilder<IDict<MapItem | null>>;
  private initialState: IDict<MapItem | null>;

  constructor(initialState: IDict<MapItem | null>) {
    this.builder = reducerWithInitialState(initialState);
    this.initialState = {...initialState};
  }

  public asyncCase(
    action: AsyncActionCreators<string, MapItem, Error>,
    handlers?: IHandlersConfig<string, MapItem, IDict<MapItem | null>>)
    : Builder<MapItem> {

    const defaultOnStartHandler = (state: IDict<MapItem | null>, params: string): IDict<MapItem | null> => {
      const newMap = {...state};
      newMap[params] = {
        loadState: LoadState.refreshing,
        content: newMap[params]?.content ?? null,
      };

      return newState(state, newMap);
    };

    const defaultOnDoneHandler = (state: IDict<MapItem | null>, {
      params,
      result,
    }: Success<string, MapItem>): IDict<MapItem | null> => {
      const newMap = {...state};
      newMap[params] = {loadState: LoadState.idle, content: result!};

      return newState(state, newMap);
    };

    const defaultOnFailHandler = (state: IDict<MapItem | null>, {params}: Failure<LoadState, Error>): IDict<MapItem | null> => {
      const newMap = {...state};
      newMap[params] = {
        loadState: LoadState.error,
        content: newMap[params]?.content ?? null,
      };

      return newState(state, newMap);
    };

    this.builder = this.builder
      .case(action.started, handlers?.onStart ?? defaultOnStartHandler)
      .case(action.done, handlers?.onDone ?? defaultOnDoneHandler)
      .case(action.failed, handlers?.onFail ?? defaultOnFailHandler);

    return this;
  }

  //TODO: Add presets fro ADD, REMOVE, EDIT, MERGE actions
  public case(
    action: ActionCreator<IDict<MapItem | null>> | ActionCreator<void>,
    handler?: Handler<IDict<MapItem | null>, IDict<MapItem | null>, any>)
    : Builder<MapItem> {
    const defaultHandler: Handler<IDict<MapItem | null>, IDict<MapItem | null>, any> = (state: IDict<MapItem | null>, payload: IDict<MapItem | null>) => {
      return typeof payload == "object" ? newState<IDict<MapItem | null>>(state, payload) : payload;
    };
    const _handler = (handler ?? defaultHandler);
    this.builder = this.builder.case(action, _handler);

    return this;
  }

  public clear(action: ActionCreator<void>): Builder<MapItem> {
    const defaultHandler: Handler<IDict<MapItem | null>, IDict<MapItem | null>, any> = (state: IDict<MapItem | null>) => {
      return typeof this.initialState == "object" ? newState<IDict<MapItem | null>>(state, this.initialState) : this.initialState;
    };
    this.builder = this.builder.case(action, defaultHandler);

    return this;
  }

  public build(): ReducerType {
    return this.builder.build();
  }
}

export class MapReducer {
  static initialState<MapItem>(initValue?: IDict<MapItem>): IDict<MapItem> {
    return initValue ?? {};
  }

  static action<MapItem>(actionName: string): AsyncActionCreators<string, MapItem, Error> {
    return actionCreator.async<string, MapItem, Error>(actionName);
  }

  static reducer<MapItem>(initialState: IDict<MapItem | null>):
    Builder<MapItem> {
    return new Builder<MapItem>(initialState);
  }
}
