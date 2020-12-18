import { expectError, expectType } from 'tsd'
import { createEffect, createEffects, SimpluxEffect } from '../src/effects'

expectType<SimpluxEffect<(s: string) => string>>(createEffect((s: string) => s))
expectType<SimpluxEffect<(s: string) => Promise<string>>>(
  createEffect(async (s: string) => s),
)

const effect = createEffect(<T>(s: T) => s)
expectType<string>(effect<string>(''))

expectError(createEffect(''))

// tslint:disable: type-literal-delimiter
// tslint:disable: trailing-comma
expectType<{
  one: SimpluxEffect<(s: string) => string>
  two: SimpluxEffect<(n: number) => number>
  three: SimpluxEffect<(s: string) => Promise<string>>
}>(
  createEffects({
    one: (s: string) => s,
    two: (n: number) => n,
    three: async (s: string) => s,
  }),
)

expectError(createEffects(''))
