import { InjectionToken } from './types';
import { Lifecycle } from './DependencyContainer';
import {
  METADATA_LIFECYCLE,
  METADATA_PARAM_TYPES,
  Constructor,
} from './internal';
/**
 * Class decorator factory that registers the class as a singleton
 *
 * @return {Function} The class decorator
 */
export function injectable<T>(
  lifecycle: Lifecycle = Lifecycle.SINGLETON
): (target: Constructor<T>) => void {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof Reflect === 'undefined' || !Reflect.getMetadata) {
      throw new Error(
        `tsyringe requires a reflect polyfill. Please add 'import "reflect-metadata"' to the top of your entry point.`
      );
    }
  }

  return (target: Constructor<T>) => {
    Reflect.defineMetadata(METADATA_LIFECYCLE, lifecycle, target);
  };
}

/**
 * Parameter decorator factory that allows for interface information to be stored in the Constructor's metadata
 *
 * @return {Function} The parameter decorator
 */
export function inject(token: InjectionToken<any>): ParameterDecorator {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof Reflect === 'undefined' || !Reflect.getMetadata) {
      throw new Error(
        `tsyringe requires a reflect polyfill. Please add 'import "reflect-metadata"' to the top of your entry point.`
      );
    }
  }

  return (target, propertyKey, parameterIndex): void => {
    const injectionTokens =
      Reflect.getOwnMetadata(METADATA_PARAM_TYPES, target) || {};
    injectionTokens[parameterIndex] = token;
    Reflect.defineMetadata(METADATA_PARAM_TYPES, injectionTokens, target);
  };
}
