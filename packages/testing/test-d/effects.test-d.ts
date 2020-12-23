import { createEffect } from '@simplux/core'
import { expectError, expectType } from 'tsd'
import { mockEffect } from '../src/effects'

const syncEffect = createEffect((s: string) => s)
const asyncEffect = createEffect(async (s: string) => s)

expectType<() => string>(mockEffect(syncEffect, () => '')[0])
expectType<() => Promise<string>>(mockEffect(asyncEffect, async () => '')[0])
expectType<() => void>(mockEffect(syncEffect, () => '')[1])

// @ts-expect-error
expectError(mockEffect(syncEffect, (s: string) => 0))

// @ts-expect-error
expectError(mockEffect(syncEffect, (a: number) => ''))

// @ts-expect-error
expectError(mockEffect(syncEffect, (s: string, b: number) => ''))
