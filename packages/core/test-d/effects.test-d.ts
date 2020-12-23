import { expectError, expectType } from 'tsd'
import { createEffect, createEffects, SimpluxEffect } from '../src/effects'

expectType<SimpluxEffect<(s: string) => string>>(createEffect((s: string) => s))
expectType<SimpluxEffect<(s: string) => Promise<string>>>(
  createEffect(async (s: string) => s),
)

const effect = createEffect(<T>(s: T) => s)
expectType<string>(effect<string>(''))

// @ts-expect-error
expectError(createEffect(''))

interface FunctionWithProps {
  (s: string): string

  someProp: string
}

const functionWithProps: FunctionWithProps = undefined!

// @ts-expect-error
expectError(createEffect(functionWithProps).someProp)

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

// @ts-expect-error
expectError(createEffects(''))

// @ts-expect-error
expectError(createEffects({ functionWithProps }).functionWithProps.someProp)
