import {ActionCreator, AsyncActionCreators, Failure, Success} from "typescript-fsa";
import {IHandlersConfig, ReducerType} from "./ReducersCommon";
import {actionCreator} from "../actionCreator";
import {Handler, ReducerBuilder, reducerWithInitialState} from "typescript-fsa-reducers";
import {IList, ILoadable, LoadState} from "../../../common/loadState";
import {combinePagesWithCursor} from "../../../common/heplers/combinePages";
import {newState} from "../../../common/utils/newState";
import {SimpleSyncReducerGenerator} from "./SimpleSyncReducerGenerator";

export type IListState<TListItem> = ILoadable<IList<TListItem>>;

export class ListAsyncReducerGenerator {
  static getInitialState<TListItem>(initValue?: TListItem[]): IListState<TListItem> {
    return {
      loadState: LoadState.needLoad,
      content: {
        data: initValue ?? [],
      },
    };
  }

  static getAction<TListItem>(actionName: string): AsyncActionCreators<LoadState, IList<TListItem>, Error> {
    return actionCreator.async<LoadState, IList<TListItem>, Error>(actionName);
  }

  static getReducers<TListItem>(
    initialState: IListState<TListItem>,
    asyncHandlers: {
      action: AsyncActionCreators<LoadState, IList<TListItem>, Error>,
      handlers?: IHandlersConfig<LoadState, IList<TListItem>, IListState<TListItem>>,
    }[],
    syncHandlers: {
      action: ActionCreator<IListState<TListItem>> | ActionCreator<void>,
      handler?: Handler<IListState<TListItem>, IListState<TListItem>, any>,
    }[],
    builder?: ReducerBuilder<IListState<TListItem>>,
  ): ReducerType {
    return ListAsyncReducerGenerator.getReducersBuilder(initialState, asyncHandlers, syncHandlers, builder).build();
  }

  static getReducersBuilder<TListItem>(
    initialState: IListState<TListItem>,
    asyncHandlers: {
      action: AsyncActionCreators<LoadState, IList<TListItem>, Error>,
      handlers?: IHandlersConfig<LoadState, IList<TListItem>, IListState<TListItem>>,
    }[],
    syncHandlers: {
      action: ActionCreator<IListState<TListItem>> | ActionCreator<void>,
      handler?: Handler<IListState<TListItem>, IListState<TListItem>, any>,
    }[],
    builder?: ReducerBuilder<IListState<TListItem>>,
  ): ReducerBuilder<IListState<TListItem>> {
    let mainBuilder = builder ?? reducerWithInitialState(initialState);

    mainBuilder = asyncHandlers.reduce((_builder, config) => {
      return ListAsyncReducerGenerator.getReducerBuilder(
        initialState, config.action, config.handlers, _builder,
      );
    }, mainBuilder);

    mainBuilder = syncHandlers.reduce((_builder, config) => {
      return SimpleSyncReducerGenerator.getReducerBuilder(
        initialState, config.action, config.handler, _builder,
      );
    }, mainBuilder);

    return mainBuilder;
  }

  static getReducer<TListItem>(
    initialState: IListState<TListItem>,
    action: AsyncActionCreators<LoadState, IList<TListItem>, Error>,
    handlers?: IHandlersConfig<LoadState, IList<TListItem>, IListState<TListItem>>,
    builder?: ReducerBuilder<IListState<TListItem>>):
    ReducerType {

    return ListAsyncReducerGenerator.getReducerBuilder(initialState, action, handlers, builder).build();
  }

  static getReducerBuilder<TListItem>(
    initialState: IListState<TListItem>,
    action: AsyncActionCreators<LoadState, IList<TListItem>, Error>,
    handlers?: IHandlersConfig<LoadState, IList<TListItem>, IListState<TListItem>>,
    builder?: ReducerBuilder<IListState<TListItem>>):
    ReducerBuilder<IListState<TListItem>> {

    const defaultOnStartHandler = (state: IListState<TListItem>, params: LoadState): IListState<TListItem> => ({
      content: state.content,
      loadState: params,
    });

    const defaultOnDoneHandler = (state: IListState<TListItem>, {
      params,
      result,
    }: Success<LoadState, IList<TListItem>>): IListState<TListItem> => {

      const {list, loadState} = combinePagesWithCursor(
        params,
        state.content.data,
        result.data,
        result.cursor);

      return newState(state, {
        content: {
          data: list,
          cursor: result?.cursor,
        },
        loadState,
      });
    };

    const defaultOnFailHandler = (state: IListState<TListItem>, {}: Failure<LoadState, Error>): IListState<TListItem> => ({
      content: state.content,
      loadState: LoadState.error,
    });

    return (builder ?? reducerWithInitialState(initialState))
      .case(action.started, handlers?.onStart ?? defaultOnStartHandler)
      .case(action.done, handlers?.onDone ?? defaultOnDoneHandler)
      .case(action.failed, handlers?.onFail ?? defaultOnFailHandler);
  }
}
