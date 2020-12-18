import { Mutable } from './types'

/**
 * This interface is used for mocking support during testing.
 *
 * @private
 */
export interface EffectMockDefinition {
  effectToMock: Function
  mockFn: Function
}

export interface EffectDefinitions {
  [name: string]: (...args: any[]) => any
}

export interface EffectMetadata {
  /**
   * The name of this effect.
   */
  readonly effectName: string
}

export type SimpluxEffect<
  TFunction extends (...args: any[]) => any
> = TFunction & EffectMetadata

/**
 * Helper interface to create a function with the same signature as an effect
 */
export type EffectFunction<
  TEffect extends SimpluxEffect<(...args: any[]) => any>
> = (...args: Parameters<TEffect>) => ReturnType<TEffect>

export type SimpluxEffects<TEffectDefinitions extends EffectDefinitions> = {
  [effectName in keyof TEffectDefinitions]: SimpluxEffect<
    TEffectDefinitions[effectName]
  >
}

const mockDefinitions: EffectMockDefinition[] = []

/**
 * Create a new effect. An effect is any function that has side effects.
 * The main purpose of this function is to allow simple mocking of the
 * effect.
 *
 * @param effect the effect to create
 *
 * @returns a function that calls the provided effect and can be mocked
 */
export function createEffect<TEffectFunction extends (...args: any[]) => any>(
  effect: TEffectFunction,
): SimpluxEffect<TEffectFunction> {
  return createEffectInternal(effect, 'unknown')
}

/**
 * Create new effects. An effect is any function that has side effects.
 * The main purpose of this function is to allow simple mocking of the
 * effect.
 *
 * @param effects the effects to create
 *
 * @returns functions that call the provided effects and can be mocked
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
 * @private
 */
export function getMockDefinitionsInternal() {
  return mockDefinitions
}
