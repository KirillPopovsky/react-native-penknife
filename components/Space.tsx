import React, {ReactElement} from "react";
import {View, ViewStyle} from "react-native";

export interface ISpaceProps extends ViewStyle {
  children?: any;
  visible?: boolean;
  flexHeight?: number;
  flexWidth?: number;
  height?: number;
}

export const Space = React.memo((props: ISpaceProps): ReactElement | null => {
  const {visible, children, flexHeight, flexWidth, height} = props;

  const maxWidth = flexWidth;
  const maxHeight = flexHeight;
  const flex = (flexHeight || flexWidth) && Math.round((flexHeight ?? flexWidth ?? 0) / 10);

  return (
    visible !== false ? (
      <View style={[props, {maxWidth, maxHeight, flex, height}]}>
        {children}
      </View>
    ) : null);
});
