import React, {FC, memo} from "react";
import {View, ViewProps} from "react-native";

interface IHidableProps {
  children?: any;
  visible?: boolean;
}

interface IHidableViewProps extends IHidableProps, ViewProps {
  containerVisible?: boolean;
}

export const Hidable: FC<IHidableProps> = memo(({visible, children}) => visible ? children : null);

export const HidableView: FC<IHidableViewProps> = memo((props) => {
  const {visible, containerVisible, children, ...other} = props;

  return visible || containerVisible ? <View {...other}>{visible ? children : null}</View> : null;
});

export function hidable<P>(WrappedComponent: React.ComponentType<P>): FC<IHidableProps & P> {
  return ({visible, ...other}) => {
    return visible ? <WrappedComponent {...other as  any}/> : null;
  };
}
