declare type ValueOf<T> = T[keyof T];

//TODO: fix this types
//@ts-ignore
type EnumObject<typeofEnum , V> = { [key in ValueOf<typeofEnum>]: V };