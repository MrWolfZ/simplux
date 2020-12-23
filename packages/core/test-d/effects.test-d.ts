import { expectError, expectType } from 'tsd'
import { createEffect, createEffects, SimpluxEffect } from '../src/effects'

expectType<SimpluxEffect<(s: string) => string>>(createEffect((s: string) => s))
expectType<SimpluxEffect<(s: string) => Promise<string>>>(
  createEffect(async (s: string) => s),
)

const genericEffect = createEffect(<T>(s: T) => s)
expectType<SimpluxEffect<<T>(s: T) => T>>(genericEffect)
expectType<SimpluxEffect<(s: string) => string>>(genericEffect)
expectType<<T>(s: T) => T>(genericEffect)
expectType<(s: string) => string>(genericEffect)
expectType<string>(genericEffect<string>(''))

// @ts-expect-error
expectError(createEffect(''))

interface FunctionWithProps {
  (s: string): string

  someProp: string
}

const functionWithProps: FunctionWithProps = undefined!

const effectWithProps = createEffect(functionWithProps)
expectType<SimpluxEffect<(s: string) => string>>(effectWithProps)
expectType<(s: string) => string>(effectWithProps)

// @ts-expect-error
expectError(effectWithProps.someProp)

const effects = createEffects({
  one: (s: string) => s,
  two: (n: number) => n,
  three: async (s: string) => s,
  genericEffect: <T>(s: T) => s,
  functionWithProps,
})

expectType<SimpluxEffect<(s: string) => string>>(effects.one)
expectType<(s: string) => string>(effects.one)

expectType<SimpluxEffect<(n: number) => number>>(effects.two)
expectType<(n: number) => number>(effects.two)

expectType<SimpluxEffect<(s: string) => Promise<string>>>(effects.three)
expectType<(s: string) => Promise<string>>(effects.three)

expectType<SimpluxEffect<<T>(s: T) => T>>(effects.genericEffect)
expectType<SimpluxEffect<(s: string) => string>>(effects.genericEffect)
expectType<<T>(s: T) => T>(effects.genericEffect)
expectType<(s: string) => string>(effects.genericEffect)
expectType<string>(effects.genericEffect('' as string))

expectType<SimpluxEffect<(s: string) => string>>(effects.functionWithProps)
expectType<(s: string) => string>(effects.functionWithProps)

// @ts-expect-error
expectError(createEffects({ functionWithProps }).functionWithProps.someProp)

// @ts-expect-error
expectError(createEffects(''))
