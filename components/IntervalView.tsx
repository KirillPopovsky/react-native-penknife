import React from "react";
import {View, ViewStyle} from "react-native";
import {ISpaceProps, Space} from "./Space";

interface IProps {
  children?: any;
  mode?: "between" | "around";
  interval?: number;
  flexInterval?: number;
  intervals?: number[];
  flexIntervals?: number[];
  style?: ViewStyle;
}

function getSpace(propName: keyof ISpaceProps, value: number): JSX.Element {
  const props: ISpaceProps = {};
  props[propName] = value;

  return <Space {...props}/>;
}

export function IntervalView(props: IProps): JSX.Element {
  const {children, interval, intervals, flexInterval, flexIntervals, style, mode} = props;
  const _mode = mode ?? "around";

  const result: any[] = [];
  let childrenCount = 0;
  const isRowDirection = style?.flexDirection == "row" || style?.flexDirection == "row-reverse";
  const propName = isRowDirection ?
    flexIntervals != null || flexInterval != null ? "flexWidth" : "width" :
    flexIntervals != null || flexInterval != null ? "flexHeight" : "height";
  console.warn(propName);

  const intervalsArray = flexIntervals ?? intervals;
  const intervalValue = flexInterval ?? interval;
  const indexOffset = _mode == "between" ? -1 : 0;

  if (intervalsArray != null) {
    React.Children.forEach(children, (child, index) => {
      if (intervalsArray[index + indexOffset] != null) {
        result.push(getSpace(propName, intervalsArray[index + indexOffset]));
      }
      result.push(child);
      childrenCount = index + 1 + indexOffset;
    });
    if (intervalsArray[childrenCount] != null) {
      result.push(getSpace(propName, intervalsArray[childrenCount]));
    }
  } else if (intervalValue != null) {
    React.Children.forEach(children, (child, index) => {
      if (_mode == "around" || index > 0) {
        result.push(getSpace(propName, intervalValue));
      }
      result.push(child);
    });
    if (_mode == "around") {
      result.push(getSpace(propName, intervalValue));
    }
  } else {
    return <>{children}</>;
  }

  return <View style={style}>{result}</View>;
}