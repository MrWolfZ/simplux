export type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | null
  | undefined

export interface ImmutableArray<T> extends ReadonlyArray<Immutable<T>> {}
export interface ImmutableMap<K, V>
  extends ReadonlyMap<Immutable<K>, Immutable<V>> {}
export interface ImmutableSet<T> extends ReadonlySet<Immutable<T>> {}
export type ImmutableObject<T> = { readonly [P in keyof T]: Immutable<T[P]> }

export type Immutable<T> = T extends ((...args: any[]) => any) | Primitive
  ? T
  : T extends ImmutableArray<infer U>
  ? ImmutableArray<U>
  : T extends ImmutableMap<infer U, infer V>
  ? ImmutableMap<U, V>
  : T extends ImmutableSet<infer U>
  ? ImmutableSet<U>
  : T extends ImmutableObject<infer V>
  ? ImmutableObject<V>
  : T
