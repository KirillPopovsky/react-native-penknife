import React, {memo, useMemo} from "react";

interface ICaseProps<T> {
  caseValue?: T;
  caseValues?: T[];
  children?: any;
}

export function Case<T>({children}: ICaseProps<T>): any {
  return children ?? null;
}

interface IDefaultProps<T> {
  children?: any;
}

export function Default<T>({children}: IDefaultProps<T>): any {
  return children ?? null;
}

interface IProps<T> {
  switchValue: T;
  children?: any;
}

function SwitchStatic<T>({children, switchValue}: IProps<T>): any {
  const defaultComponents: any = [];

  const caseComponents = useMemo(() => React.Children.map(children, (child) => {
    if (child.type == Default) {
      defaultComponents.push(child);
    }

    return child.type == Case ? (
      child.props.caseValue == switchValue ||
      child.props.caseValues?.indexOf(switchValue) > -1
        ? child : null) : null;
  }), [children, switchValue]);

  return caseComponents.length > 0 ? caseComponents : defaultComponents;
}

export const Switch = memo(SwitchStatic);