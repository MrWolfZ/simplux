import { Immutable, Mutable } from '@simplux/core'
import { expectType } from 'tsd'

// tslint:disable:trailing-comma type-literal-delimiter

interface S {
  foo: string
  bar: {
    foo: number
    bar: string[]
  }
  baz: {
    bar: string[]
  }[]
}

interface S2 {
  foo: string
  bar: {
    readonly foo: number
    bar: string[]
  }
  baz: readonly {
    bar: string[]
  }[]
}

interface S3 {
  foo: string
  bar: {
    foo: number
    bar: readonly string[]
  }
  baz: {
    bar: readonly string[]
  }[]
}

interface S4 {
  readonly foo: string
  readonly bar: {
    readonly foo: number
    readonly bar: readonly string[]
  }
  readonly baz: readonly {
    readonly bar: readonly string[]
  }[]
}

interface S5 {
  bar: {
    set: Set<string[]>
    map: Map<string, string[]>
  }
}

interface S6 {
  readonly bar: {
    readonly set: ReadonlySet<readonly string[]>
    readonly map: ReadonlyMap<string, readonly string[]>
  }
}

expectType<string>(undefined! as Mutable<string>)
expectType<number>(undefined! as Mutable<number>)
expectType<boolean>(undefined! as Mutable<boolean>)
expectType<undefined>(undefined! as Mutable<undefined>)
expectType<null>(undefined! as Mutable<null>)
expectType<string | undefined>(undefined! as Mutable<string | undefined>)
expectType<Date>(undefined! as Mutable<Date>)
expectType<RegExp>(undefined! as Mutable<RegExp>)
expectType<Promise<string>>(undefined! as Mutable<Promise<string>>)
expectType<(s: string) => string>(undefined! as Mutable<(s: string) => string>)

expectType<string[]>(undefined! as Mutable<readonly string[]>)
expectType<{ foo: string }[]>(undefined! as Mutable<readonly { foo: string }[]>)
expectType<{ foo: string }[]>(
  undefined! as Mutable<readonly { readonly foo: string }[]>,
)

expectType<{ foo: string }>(undefined! as Mutable<{ readonly foo: string }>)
expectType<{ foo: string[] }>(
  undefined! as Mutable<{
    readonly foo: readonly string[]
  }>,
)

expectType<Set<string>>(undefined! as Mutable<ReadonlySet<string>>)
expectType<Set<string[]>>(undefined! as Mutable<ReadonlySet<string[]>>)
expectType<Set<string[]>>(undefined! as Mutable<ReadonlySet<readonly string[]>>)

expectType<Map<string, string>>(
  undefined! as Mutable<ReadonlyMap<string, string>>,
)
expectType<Map<string, string[]>>(
  undefined! as Mutable<ReadonlyMap<string, string[]>>,
)
expectType<Map<string, string[]>>(
  undefined! as Mutable<ReadonlyMap<string, readonly string[]>>,
)

expectType<S>(undefined! as Mutable<S>)
expectType<S>(undefined! as Mutable<S2>)
expectType<S>(undefined! as Mutable<S3>)
expectType<S>(undefined! as Mutable<S4>)
expectType<S5>(undefined! as Mutable<S5>)
expectType<S5>(undefined! as Mutable<S6>)

expectType<string>(undefined! as Immutable<string>)
expectType<number>(undefined! as Immutable<number>)
expectType<boolean>(undefined! as Immutable<boolean>)
expectType<undefined>(undefined! as Immutable<undefined>)
expectType<null>(undefined! as Immutable<null>)
expectType<string | undefined>(undefined! as Immutable<string | undefined>)
expectType<Date>(undefined! as Immutable<Date>)
expectType<RegExp>(undefined! as Immutable<RegExp>)
expectType<Promise<string>>(undefined! as Immutable<Promise<string>>)
expectType<(s: string) => string>(
  undefined! as Immutable<(s: string) => string>,
)

expectType<Immutable<string[]>>(undefined! as readonly string[])
expectType<Immutable<{ readonly foo: string }[]>>(
  undefined! as readonly {
    readonly foo: string
  }[],
)
expectType<Immutable<readonly { foo: string }[]>>(
  undefined! as readonly {
    readonly foo: string
  }[],
)

expectType<Immutable<{ foo: string }>>(undefined! as { readonly foo: string })
expectType<
  Immutable<{
    foo: string[]
  }>
>(undefined! as { readonly foo: readonly string[] })

expectType<Immutable<Set<string>>>(undefined! as ReadonlySet<string>)
expectType<Immutable<Set<string[]>>>(
  undefined! as ReadonlySet<readonly string[]>,
)
expectType<Immutable<Set<readonly string[]>>>(
  undefined! as ReadonlySet<readonly string[]>,
)

expectType<Immutable<Map<string, string>>>(
  undefined! as ReadonlyMap<string, string>,
)
expectType<Immutable<Map<string, string[]>>>(
  undefined! as ReadonlyMap<string, readonly string[]>,
)
expectType<Immutable<Map<string, readonly string[]>>>(
  undefined! as ReadonlyMap<string, readonly string[]>,
)

expectType<Immutable<S>>(undefined! as S4)
expectType<Immutable<S2>>(undefined! as S4)
expectType<Immutable<S3>>(undefined! as S4)
expectType<Immutable<S4>>(undefined! as S4)
expectType<Immutable<S5>>(undefined! as S6)
expectType<Immutable<S6>>(undefined! as S6)
