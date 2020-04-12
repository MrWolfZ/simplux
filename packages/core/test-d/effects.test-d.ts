import { expectError, expectType } from 'tsd'
import { createEffect } from '../src/effects'

expectType<(s: string) => string>(createEffect((s: string) => s))
expectType<(s: string) => Promise<string>>(createEffect(async (s: string) => s))
expectError(createEffect(''))
