import type {
  _ParameterName,
  _ParameterType,
  _ParseParameter,
} from './parameter.js'

/**
 * A constant path segment for a route.
 *
 * @public
 */
export type _RoutePathTemplateConstantSegment = string

/**
 * A parameter path segment for a route.
 *
 * @public
 */
export interface _RoutePathTemplateParameterSegment {
  readonly parameterName: _ParameterName
  readonly parameterType: _ParameterType
}

/**
 * A path segment for a route.
 *
 * @public
 */
export type _RoutePathTemplateSegment =
  | _RoutePathTemplateConstantSegment
  | _RoutePathTemplateParameterSegment

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
