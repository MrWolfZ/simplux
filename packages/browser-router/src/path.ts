import type { _ParseParameter } from './parameter.js'

/**
 * Helper type to parse parameters from a path template.
 *
 * @public
 */
export type _ParsePathParameters<
  TTemplate
> = TTemplate extends `${infer TSegment}/${infer TRest}`
  ? _ParseParameter<TSegment, ':'> & _ParsePathParameters<TRest>
  : _ParseParameter<TTemplate, ':'>
