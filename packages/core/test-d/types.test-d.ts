import { expectType } from 'tsd'
import { Immutable, Mutable } from '../src/types'

// tslint:disable:trailing-comma type-literal-delimiter

interface S {
  foo: string
  bar: {
    foo: number
    bar: string[]
  }
}

interface S2 {
  foo: string
  bar: {
    readonly foo: number
    bar: string[]
  }
}

interface S3 {
  foo: string
  bar: {
    foo: number
    bar: readonly string[]
  }
}

interface S4 {
  readonly foo: string
  readonly bar: {
    readonly foo: number
    readonly bar: readonly string[]
  }
}

expectType<{ foo: string }>(undefined! as Mutable<{ readonly foo: string }>)
expectType<{ foo: string[] }>(undefined! as Mutable<{
  readonly foo: readonly string[]
}>)

expectType<S>(undefined! as Mutable<S>)
expectType<S>(undefined! as Mutable<S2>)
expectType<S>(undefined! as Mutable<S3>)
expectType<S>(undefined! as Mutable<S4>)

expectType<{ readonly foo: string }>(undefined! as Immutable<{ foo: string }>)
expectType<{ readonly foo: readonly string[] }>(undefined! as Immutable<{
  foo: string[]
}>)

expectType<S4>(undefined! as Immutable<S>)
expectType<S4>(undefined! as Immutable<S2>)
expectType<S4>(undefined! as Immutable<S3>)
expectType<S4>(undefined! as Immutable<S4>)
