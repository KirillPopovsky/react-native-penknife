import {ActionCreator, AsyncActionCreators, Failure, Success} from "typescript-fsa";
import {IHandlersConfig, ReducerType} from "./ReducersCommon";
import {actionCreator} from "../actionCreator";
import {Handler, ReducerBuilder, reducerWithInitialState} from "typescript-fsa-reducers";
import {LoadState} from "../../../common/loadState";
import {newState} from "../../../common/utils/newState";
import {IDict} from "../../../common/interfaces";
import {SimpleSyncReducerGenerator} from "./SimpleSyncReducerGenerator";

//todo: remove "get" from names
export class MapAsyncReducerGenerator {
  static getInitialState<MapItem>(initValue?: IDict<MapItem>): IDict<MapItem> {
    return initValue ?? {};
  }

  static getAction<MapItem>(actionName: string): AsyncActionCreators<string, MapItem, Error> {
    return actionCreator.async<string, MapItem, Error>(actionName);
  }

  static getReducer<MapItem>(
    initialState: IDict<MapItem | null>,
    action: AsyncActionCreators<string, MapItem, Error>,
    handlers?: IHandlersConfig<string, MapItem, IDict<MapItem | null>>,
    builder?: ReducerBuilder<IDict<MapItem | null>>):
    ReducerType {
    return MapAsyncReducerGenerator.getReducerBuilder(initialState, action, handlers, builder).build();
  }

  static getReducers<MapItem>(
    initialState: IDict<MapItem | null>,
    asyncHandlers: {
      action: AsyncActionCreators<string, MapItem, Error>,
      handlers?: IHandlersConfig<string, MapItem, IDict<MapItem | null>>,
    }[],
    syncHandlers?: {
      action: ActionCreator<IDict<MapItem | null>> | ActionCreator<void>,
      handler?: Handler<IDict<MapItem | null>, IDict<MapItem | null>, any>,
    }[],
    builder?: ReducerBuilder<IDict<MapItem | null>>,
  ): ReducerType {
    return MapAsyncReducerGenerator.getReducersBuilder(initialState, asyncHandlers, syncHandlers, builder).build();
  }

  static getReducersBuilder<MapItem>(
    initialState: IDict<MapItem | null>,
    asyncHandlers: {
      action: AsyncActionCreators<string, MapItem, Error>,
      handlers?: IHandlersConfig<string, MapItem, IDict<MapItem | null>>,
    }[],
    syncHandlers?: {
      action: ActionCreator<IDict<MapItem | null>> | ActionCreator<void>,
      handler?: Handler<IDict<MapItem | null>, IDict<MapItem | null>, any>,
    }[],
    builder?: ReducerBuilder<IDict<MapItem | null>>,
  ): ReducerBuilder<IDict<MapItem | null>> {
    let mainBuilder = builder ?? reducerWithInitialState(initialState);

    mainBuilder = asyncHandlers.reduce((_builder, config) => {
      return MapAsyncReducerGenerator.getReducerBuilder(
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

  static getReducerBuilder<MapItem>(
    initialState: IDict<MapItem | null>,
    action: AsyncActionCreators<string, MapItem, Error>,
    handlers?: IHandlersConfig<string, MapItem, IDict<MapItem | null>>,
    builder?: ReducerBuilder<IDict<MapItem | null>>):
    ReducerBuilder<IDict<MapItem | null>> {

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

    const _builder = (builder ?? reducerWithInitialState(initialState))
      .case(action.started, handlers?.onStart ?? defaultOnStartHandler)
      .case(action.done, handlers?.onDone ?? defaultOnDoneHandler)
      .case(action.failed, handlers?.onFail ?? defaultOnFailHandler);

    return _builder;
  }
}
