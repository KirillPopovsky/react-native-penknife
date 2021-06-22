import React from "react";
import {
  FlatList as NativeFlatList,
  FlatListProps,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

export interface IFlatListProps<T> extends Omit<FlatListProps<T>, "refreshing"> {
  loading: Loading;
  onTryAgain: () => void;
  onLoadMore?: () => void;
  EmptyComponent?: (React.ComponentClass<any>) | (() => JSX.Element);
  ErrorComponent?: (React.ComponentClass<any>) | (() => JSX.Element);
  PreloadComponent?: (React.ComponentClass<any>) | (() => JSX.Element);
}

export function FlatList<T>(props: IFlatListProps<T>): JSX.Element {
  const {loading, ...flatListProps} = props;
  const refreshing = loading == Loading.refreshing;
  if ((flatListProps.data ?? []).length > 0) {
    if (loading == Loading.blank || loading == Loading.initial) {

    }

  } else {
    return <NativeFlatList
      refreshing={refreshing}
      {...flatListProps}
    />;
  }
}

export interface ITryAgainProps {
  containerStyle?: ViewStyle;
  messageStyle?: TextStyle;
  message?: string;
  reloadTextStyle?: TextStyle;
  reloadText?: string;
  onTryAgainPress: () => void;
}

export function TryAgain(props: ITryAgainProps): JSX.Element {
  const {containerStyle, messageStyle, reloadTextStyle, message, reloadText, onTryAgainPress} = props;

  return (
    <TouchableOpacity style={containerStyle ?? tryAgainStyles.container} onPress={onTryAgainPress}>
      <Text style={messageStyle ?? tryAgainStyles.message}>{message ?? "Oops! Something went wrong!"}</Text>
      <Text style={reloadTextStyle ?? tryAgainStyles.reload}>{reloadText ?? "Reload"}</Text>
    </TouchableOpacity>
  );
}

const tryAgainStyles = StyleSheet.create({
  container: {
    flexDirection: "column",
  } as ViewStyle,
  message: {
    fontSize: 20,
    color: "#343a40",
  } as TextStyle,
  reload: {
    fontSize: 18,
    color: "#0081FF",
  } as TextStyle,

});

export enum Loading {
  //pending statuses
  blank = "blank",   //there is nothing loaded so far
  idle = "idle",  //some data was loaded, pending refreshing or loading more
  failed = "failed", // loading failed
  completed = "completed", //there is nothing to load more

  //loading statuses
  initial = "initial",  // first loading, used for infinite lists
  refreshing = "refreshing", //refreshing 0_o
  more = "more", // loading additional data, used for infinite lists
}

//blank>>initial>>failed>>refreshing>>idle>>more>>completed

const loadingStates = [Loading.more, Loading.refreshing, Loading.initial];
const refreshingStates = [Loading.refreshing, Loading.initial];

export function isLoading(loadState?: Loading): boolean {
  return loadState ? loadingStates.indexOf(loadState) > -1 : false;
}

export function failed(loadState?: Loading): boolean {
  return loadState == Loading.failed;
}

export function isRefreshing(loadState?: Loading): boolean {
  return loadState ? refreshingStates.indexOf(loadState) > -1 : false;
}

export type Loadable<T> = {
  loadingState: Loading;
  content: T;
}

