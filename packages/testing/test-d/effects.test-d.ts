import { createEffect } from '@simplux/core'
import { mockEffect } from '@simplux/testing'
import { expectError, expectType } from 'tsd'

const syncEffect = createEffect((s: string) => s)
const asyncEffect = createEffect(async (s: string) => s)

expectType<() => string>(mockEffect(syncEffect, () => '')[0])
expectType<() => Promise<string>>(mockEffect(asyncEffect, async () => '')[0])
expectType<() => void>(mockEffect(syncEffect, () => '')[1])

// @ts-expect-error
expectError(mockEffect(syncEffect, (_: string) => 0))

// @ts-expect-error
expectError(mockEffect(syncEffect, (_: number) => ''))

// @ts-expect-error
expectError(mockEffect(syncEffect, (_: string, _2: number) => ''))
