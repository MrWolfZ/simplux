import { FunctionSignature, Mutable } from './types'

/**
 * This interface is used for mocking support during testing.
 *
 * @internal
 */
export interface _EffectMockDefinition {
  readonly effectToMock: Function
  readonly mockFn: Function
}

/**
 * The functions to turn into effects.
 *
 * @public
 */
export interface EffectDefinitions {
  readonly [name: string]: (...args: any[]) => any
}

/**
 * @public
 */
export interface EffectMetadata {
  /**
   * The name of this effect.
   */
  readonly effectName: string
}

/**
 * A function with side-effects that can be easily mocked for testing.
 *
 * @public
 */
export type SimpluxEffect<
  TFunction extends (...args: any[]) => any
> = FunctionSignature<TFunction> & EffectMetadata

/**
 * A collection of functions with side-effects that can be easily mocked for testing.
 *
 * @public
 */
export type SimpluxEffects<TEffectDefinitions extends EffectDefinitions> = {
  [effectName in keyof TEffectDefinitions]: SimpluxEffect<
    TEffectDefinitions[effectName]
  >
}

const mockDefinitions: _EffectMockDefinition[] = []

/**
 * Create a new effect. An effect is any function that has side effects.
 * The main purpose of this function is to allow simple mocking of the
 * effect.
 *
 * @param effect - the effect to create
 *
 * @returns a function that calls the provided effect and can be mocked
 *
 * @public
 */
export function createEffect<TEffectFunction extends (...args: any[]) => any>(
  effect: TEffectFunction,
): SimpluxEffect<TEffectFunction> {
  return createEffectInternal(effect, 'n/a')
}

/**
 * Create new effects. An effect is any function that has side effects.
 * The main purpose of this function is to allow simple mocking of the
 * effect.
 *
 * @param effects - the effects to create
 *
 * @returns functions that call the provided effects and can be mocked
 *
 * @public
 */
export function createEffects<TEffectDefinitions extends EffectDefinitions>(
  effects: TEffectDefinitions,
): SimpluxEffects<TEffectDefinitions> {
  return Object.keys(effects).reduce(
    (res, key) => ({ ...res, [key]: createEffectInternal(effects[key], key) }),
    {} as SimpluxEffects<TEffectDefinitions>,
  )
}

function createEffectInternal<TEffectFunction extends (...args: any[]) => any>(
  effect: TEffectFunction,
  effectName: string,
): SimpluxEffect<TEffectFunction> {
  const effectFn = (...args: any[]) => {
    const mockDef = mockDefinitions.find(
      ({ effectToMock }) => effectToMock === effectFn,
    )

    if (mockDef) {
      return mockDef.mockFn(...args)
    }

    return effect(...args)
  }

  const result = (effectFn as unknown) as Mutable<
    SimpluxEffect<TEffectFunction>
  >

  result.effectName = effectName

  return result as SimpluxEffect<TEffectFunction>
}

/**
 * This interface is used for mocking support during testing.
 * It is part of the internal simplux API and should not be
 * used directly by application code.
 *
 * @internal
 */
export function _getEffectMockDefinitionsInternal() {
  return mockDefinitions
}
