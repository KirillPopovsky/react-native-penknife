import {ActionCreator, AsyncActionCreators, Failure, Success} from "typescript-fsa";
import {IHandlersConfig, ReducerType} from "./ReducersCommon";
import {actionCreator} from "../actionCreator";
import {Handler, ReducerBuilder, reducerWithInitialState} from "typescript-fsa-reducers";
import {IList, ILoadable, LoadState} from "../../../common/loadState";
import {combinePagesWithCursor} from "../../../common/heplers/combinePages";
import {newState} from "../../../common/utils/newState";

export type IListState<TListItem> = ILoadable<IList<TListItem>>;

class Builder<TListItem> {
  private builder: ReducerBuilder<IListState<TListItem>>;
  private initialState: IListState<TListItem>;

  constructor(initialState: IListState<TListItem>) {
    this.builder = reducerWithInitialState(initialState);
    this.initialState = {...initialState};
  }

  public asyncCase(
    action: AsyncActionCreators<LoadState, IList<TListItem>, Error>,
    handlers?: IHandlersConfig<LoadState, IList<TListItem>, IListState<TListItem>>)
    : Builder<TListItem> {

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
    this.builder = this.builder
      .case(action.started, handlers?.onStart ?? defaultOnStartHandler)
      .case(action.done, handlers?.onDone ?? defaultOnDoneHandler)
      .case(action.failed, handlers?.onFail ?? defaultOnFailHandler);

    return this;
  }

  public case(
    action: ActionCreator<IListState<TListItem>> | ActionCreator<void>,
    handler?: Handler<IListState<TListItem>, IListState<TListItem>, any>)
    : Builder<TListItem> {
    const defaultHandler: Handler<IListState<TListItem>, IListState<TListItem>, any> = (state: IListState<TListItem>, payload: IListState<TListItem>) => {
      return newState<IListState<TListItem>>(state, payload);
    };
    const _handler = (handler ?? defaultHandler);
    this.builder = this.builder.case(action, _handler);

    return this;
  }

  public clear(action: ActionCreator<void>): Builder<TListItem> {
    const defaultHandler: Handler<IListState<TListItem>, IListState<TListItem>, any> = (state: IListState<TListItem>) => {
      return newState<IListState<TListItem>>(state, this.initialState);
    };
    this.builder = this.builder.case(action, defaultHandler);

    return this;
  }

  public build(): ReducerType {
    return this.builder.build();
  }
}

export class ListReducer {
  static initialState<TListItem>(initValue?: TListItem[]): IListState<TListItem> {
    return {
      loadState: LoadState.needLoad,
      content: {
        data: initValue ?? [],
      },
    };
  }

  static action<TListItem>(actionName: string): AsyncActionCreators<LoadState, IList<TListItem>, Error> {
    return actionCreator.async<LoadState, IList<TListItem>, Error>(actionName);
  }

  static reducers<TListItem>(
    initialState: IListState<TListItem>,
  ): Builder<TListItem> {
    return new Builder<TListItem>(initialState);
  }
}
