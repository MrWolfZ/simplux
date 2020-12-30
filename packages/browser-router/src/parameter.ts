/**
 * Helper type to distinguish parameter name values.
 *
 * @public
 */
export type _ParameterName = string

/**
 * Helper type to distinguish parameter type values.
 *
 * @public
 */
// TODO: add object support
export type _ParameterType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'string[]'
  | 'number[]'
  | 'boolean[]'

/**
 * @internal
 */
export type _ParameterValueType = string | number | boolean | any[]

/**
 * Helper type to parse the type of a parameter from a parameter template.
 *
 * @public
 */
export type _ParseParameterType<T> = T extends `${infer TItem}[]`
  ? _ParseParameterType<TItem>[]
  : T extends `string`
  ? string
  : T extends `number`
  ? number
  : T extends `boolean`
  ? boolean
  : T

/**
 * Helper type to parse a parameter template.
 *
 * @public
 */
export type _ParseParameter<
  TTemplate,
  TPrefix extends string = ''
> = TTemplate extends `${TPrefix}${infer TName}:${infer TType}`
  ? { [name in TName]: _ParseParameterType<TType> }
  : TTemplate extends `${TPrefix}${infer TName}`
  ? { [name in TName]: string }
  : {}
