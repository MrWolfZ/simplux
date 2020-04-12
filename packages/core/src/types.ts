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

export type Mutable<T> = T extends AtomicObject
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
  : T extends Map<infer K, infer V>
  ? Omit<Map<K, V>, 'set' | 'delete' | 'clear'>
  : T extends Set<infer V>
  ? Omit<Set<V>, 'add' | 'delete' | 'clear'>
  : T extends object
  ? { readonly [K in keyof T]: Immutable<T[K]> }
  : T
