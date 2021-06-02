import React, {FC, memo, useMemo} from "react";
import {StyleSheet, Text as RNText, TextProps, TextStyle} from "react-native";

interface IProps extends TextProps {
  color?: string;
  style?: TextStyle;
  letterSpacing?: number;
  fontSize?: number;
  lineHeight?: number;
}

export const Text: FC<IProps> = memo((props) => {
    const {color, letterSpacing, fontSize, style, lineHeight, ...other} = props;
    const resultStyle = useMemo(() => StyleSheet.flatten([
      style,
      color ? {color} : {},
      letterSpacing ? {letterSpacing} : {},
      fontSize ? {fontSize} : {},
      lineHeight ? {lineHeight} : {},
    ]), [style, color, letterSpacing, fontSize, lineHeight]);

    return (
      <RNText
        style={resultStyle}
        {...other}
      />
    );
  },
);
