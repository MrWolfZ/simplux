import { expectError, expectType } from 'tsd'
import { createEffect, createEffects, Effect } from '../src/effects'

expectType<Effect<(s: string) => string>>(createEffect((s: string) => s))
expectType<Effect<(s: string) => Promise<string>>>(
  createEffect(async (s: string) => s),
)
expectError(createEffect(''))

// tslint:disable: type-literal-delimiter
// tslint:disable: trailing-comma
expectType<{
  one: Effect<(s: string) => string>
  two: Effect<(n: number) => number>
  three: Effect<(s: string) => Promise<string>>
}>(
  createEffects({
    one: (s: string) => s,
    two: (n: number) => n,
    three: async (s: string) => s,
  }),
)

expectError(createEffects(''))
