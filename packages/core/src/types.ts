// the monstrosities below are used to "prettify" types when viewing
// type hints in an IDE; with the straightforward approach to mapping
// mutable and immutable types, those types that are already immutable
// or mutable will still be shown as mapped types, e.g. given
// interface I1 { readonly foo: string } then Immutable<I1> will not
// show I1 but instead { readonly foo: string } in the IDE; the types
// below solve this by checking if a type already is mutable or
// immutable; obviously this adds a cost to compilation time, but so
// far, I have not experienced any too adverse effects; should performance
// become an issue in the future, simply drop the IfMutable/IfImmutable
// branches

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X
  ? 1
  : 2) extends (<T>() => T extends Y ? 1 : 2)
  ? A
  : B

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P
  >
}[keyof T]

type ReadonlyKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    never,
    P
  >
}[keyof T]

type AtomicObject =
  | Function
  | WeakMap<any, any>
  | WeakSet<any>
  | Promise<any>
  | Date
  | RegExp
  | Boolean
  | Number
  | String

type IsMutable<T> = T extends AtomicObject
  ? true
  : T extends Map<any, any>
  ? true
  : T extends Set<any>
  ? true
  : T extends any[]
  ? true
  : T extends object
  ? Exclude<keyof T, WritableKeys<T>> extends never
    ? {
        [K in keyof T]: IsMutable<T[K]> extends true ? true : false
      }[keyof T] extends true
      ? true
      : false
    : false
  : true

type IsImmutable<T> = T extends AtomicObject
  ? true
  : T extends Map<any, any>
  ? Omit<Map<any, any>, 'set' | 'delete' | 'clear'> extends T
    ? true
    : false
  : T extends Set<any>
  ? Omit<Set<any>, 'add' | 'delete' | 'clear'> extends T
    ? true
    : false
  : readonly any[] extends T
  ? true
  : T extends object
  ? Exclude<keyof T, ReadonlyKeys<T>> extends never
    ? {
        [K in keyof T]: IsImmutable<T[K]> extends true ? true : false
      }[keyof T] extends true
      ? true
      : false
    : false
  : true

export type Mutable<T> = T extends AtomicObject
  ? T
  : IsMutable<T> extends true
  ? T
  : T extends Map<infer K, infer V>
  ? Map<Mutable<K>, Mutable<V>>
  : T extends Set<infer V>
  ? Set<Mutable<V>>
  : T extends object
  ? { -readonly [K in keyof T]: Mutable<T[K]> }
  : T

export type Immutable<T> = T extends AtomicObject
  ? T
  : IsImmutable<T> extends true
  ? T
  : T extends Map<infer K, infer V>
  ? Omit<Map<K, V>, 'set' | 'delete' | 'clear'>
  : T extends Set<infer V>
  ? Omit<Set<V>, 'add' | 'delete' | 'clear'>
  : T extends object
  ? { readonly [K in keyof T]: Immutable<T[K]> }
  : T
