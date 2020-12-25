import type {
  _ParameterName,
  _ParameterType,
  _ParseParameter,
} from './parameter.js'

/**
 * A query parameter for a route.
 *
 * @public
 */
export interface _RouteQueryParameter {
  readonly parameterName: _ParameterName
  readonly parameterType: _ParameterType
  readonly isOptional: boolean
}

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
