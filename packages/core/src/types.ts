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
// branches; in addition, we exclude some tricky cases like maps and sets

/**
 * @public
 */
export type _IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X
  ? 1
  : 2) extends <T>() => T extends Y ? 1 : 2
  ? A
  : B

/**
 * @public
 */
export type _WritableKeys<T> = {
  [P in keyof T]-?: _IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P
  >
}[keyof T]

/**
 * @public
 */
export type _ReadonlyKeys<T> = {
  [P in keyof T]-?: _IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    never,
    P
  >
}[keyof T]

/**
 * @public
 */
export type _AtomicObject =
  | Promise<unknown>
  | Date
  | RegExp
  | Boolean
  | Number
  | String

/**
 * @public
 */
export type _IsAtomicObject<T> = T extends _AtomicObject ? true : false

/**
 * @public
 */
export type _MutableArray<T> = T extends readonly (infer U)[]
  ? Mutable<U>[]
  : never

/**
 * @public
 */
export type _IsMutable<T> = T extends _AtomicObject
  ? true
  : T extends _MutableArray<T>
  ? true
  : T extends object
  ? Exclude<keyof T, _WritableKeys<T>> extends never
    ? {
        [K in keyof T]: _IsMutable<T[K]> extends true ? true : false
      }[keyof T] extends true
      ? true
      : false
    : false
  : true

/**
 * @public
 */
export type _IsImmutableArray<T> = T extends unknown[]
  ? false
  : T extends readonly (infer U)[]
  ? { [K in keyof T]: _IsImmutable<U> }[number] extends true
    ? true
    : false
  : false

/**
 * @public
 */
export type _IsImmutableObject<T> = T extends object
  ? Exclude<keyof T, _ReadonlyKeys<T>> extends false
    ? {
        [K in keyof T]: _IsImmutable<T[K]> extends true ? true : false
      }[keyof T] extends true
      ? true
      : false
    : false
  : false

/**
 * @public
 */
export type _IsImmutable<T> = _IsAtomicObject<T> extends true
  ? true
  : _IsImmutableArray<T> extends true
  ? true
  : _IsImmutableObject<T> extends true
  ? true
  : false

/**
 * A type that recursively converts another type to be mutable, i.e.
 * all readonly modifiers are removed from properties and arrays.
 *
 * @public
 */
export type Mutable<T> = T extends _AtomicObject
  ? T
  : _IsMutable<T> extends true
  ? T
  : T extends readonly (infer U)[]
  ? Mutable<U>[]
  : T extends ReadonlyMap<infer K, infer V>
  ? Map<Mutable<K>, Mutable<V>>
  : T extends ReadonlySet<infer V>
  ? Set<Mutable<V>>
  : T extends object
  ? { -readonly [K in keyof T]: Mutable<T[K]> }
  : T

/**
 * A type that recursively converts another type to be immutable, i.e.
 * all properties and arrays become readonly.
 *
 * @public
 */
export type Immutable<T> = T extends _AtomicObject
  ? T
  : _IsImmutable<T> extends true
  ? T
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<Immutable<K>, Immutable<V>>
  : T extends ReadonlySet<infer V>
  ? ReadonlySet<Immutable<V>>
  : T extends object
  ? { readonly [K in keyof T]: Immutable<T[K]> }
  : T

/**
 * @public
 */
export type _NonFunctionProperties<TFunction extends Function> = Exclude<
  keyof TFunction,
  keyof Function
>

/**
 * Helper type to create a function type with the same signature as a given function
 *
 * @public
 */
export type FunctionSignature<TFunction extends (...args: any[]) => any> =
  // if the function is a raw function object we return its type directly to preserve
  // its generic parameters (if any)
  _NonFunctionProperties<TFunction> extends never
    ? TFunction
    : TFunction extends (...args: infer TArgs) => infer TReturn
    ? (...args: TArgs) => TReturn
    : never
