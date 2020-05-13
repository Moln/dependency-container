import { Constructor, InjectionToken } from './types';

export const METADATA = {
  DESIGN_PARAM_TYPES: 'design:paramtypes',
  PARAM_TYPES: 'dependency:paramtypes',
  TRANSIENT: 'dependency:transient',
  SINGLETON: 'dependency:singleton',
};

/**
 * Class decorator factory that registers the class as a singleton
 *
 * @return {Function} The class decorator
 */
export function injection<T>(
  singleton: boolean = true
): (target: Constructor<T>) => void {
  return (target: Constructor<T>) => {
    Reflect.defineMetadata(
      singleton ? METADATA.SINGLETON : METADATA.TRANSIENT,
      true,
      target
    );
  };
}

/**
 * Parameter decorator factory that allows for interface information to be stored in the Constructor's metadata
 *
 * @return {Function} The parameter decorator
 */
export function inject(token: InjectionToken<any>): ParameterDecorator {
  return (target, propertyKey, parameterIndex): void => {
    const injectionTokens =
      Reflect.getOwnMetadata(METADATA.PARAM_TYPES, target) || {};
    injectionTokens[parameterIndex] = token;
    Reflect.defineMetadata(METADATA.PARAM_TYPES, injectionTokens, target);
  };
}
