import type { _ParseParameter } from './parameter.js'

/**
 * Helper type to parse parameters from a query template.
 *
 * @public
 */
export type _ParseQueryParameters<
  TTemplate extends string
> = TTemplate extends `${infer TSegment}[&${infer TRest}]`
  ? _ParseParameter<TSegment> & Partial<_ParseQueryParameters<TRest>>
  : TTemplate extends `${infer TSegment}&${infer TRest}`
  ? _ParseParameter<TSegment> & _ParseQueryParameters<TRest>
  : _ParseParameter<TTemplate>
