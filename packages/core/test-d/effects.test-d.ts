import { createEffect, createEffects, SimpluxEffect } from '@simplux/core'
import { expectAssignable, expectError, expectType } from 'tsd'

expectType<SimpluxEffect<(s: string) => string>>(createEffect((s: string) => s))
expectType<SimpluxEffect<(s: string) => Promise<string>>>(
  createEffect(async (s: string) => s),
)

const genericEffect = createEffect(<T>(s: T) => s)
expectType<SimpluxEffect<<T>(s: T) => T>>(genericEffect)
expectAssignable<SimpluxEffect<(s: string) => string>>(genericEffect)
expectAssignable<<T>(s: T) => T>(genericEffect)
expectAssignable<(s: string) => string>(genericEffect)
expectType<string>(genericEffect<string>(''))

// @ts-expect-error
expectError(createEffect(''))

interface FunctionWithProps {
  (s: string): string

  someProp: string
}

const functionWithProps: FunctionWithProps = undefined!

const effectWithProps = createEffect(functionWithProps)
expectType<SimpluxEffect<FunctionWithProps>>(effectWithProps)
expectAssignable<(s: string) => string>(effectWithProps)

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
expectAssignable<(s: string) => string>(effects.one)

expectType<SimpluxEffect<(n: number) => number>>(effects.two)
expectAssignable<(n: number) => number>(effects.two)

expectType<SimpluxEffect<(s: string) => Promise<string>>>(effects.three)
expectAssignable<(s: string) => Promise<string>>(effects.three)

expectType<SimpluxEffect<<T>(s: T) => T>>(effects.genericEffect)
expectAssignable<SimpluxEffect<(s: string) => string>>(effects.genericEffect)
expectAssignable<<T>(s: T) => T>(effects.genericEffect)
expectAssignable<(s: string) => string>(effects.genericEffect)
expectType<string>(effects.genericEffect('' as string))

expectType<SimpluxEffect<FunctionWithProps>>(effects.functionWithProps)
expectAssignable<(s: string) => string>(effects.functionWithProps)

// @ts-expect-error
expectError(createEffects({ functionWithProps }).functionWithProps.someProp)

// @ts-expect-error
expectError(createEffects(''))
