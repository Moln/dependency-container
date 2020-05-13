import { InjectionToken, ServiceMiddleware, ServiceMiddlewares } from './types';
import { isNormalToken } from './';

export function matchedMiddleware<T>(
  validToken: InjectionToken<T>,
  middlewares: Array<ServiceMiddleware<T>>
): ServiceMiddleware<T> {
  return (container, token, next) => {
    if (token !== validToken) {
      return next();
    }

    return middlewares.reduce<() => T>(
      (p, c) => () => c(container, token, p),
      next
    )();
  };
}

export function matchedServiceMiddlewares<T>(
  validToken: InjectionToken<T>,
  middlewares: ServiceMiddlewares
): ServiceMiddleware<T> {
  return (container, token, next) => {
    if (isNormalToken(token)) {
      // @ts-ignore see https://github.com/Microsoft/TypeScript/pull/26797, add TS 3.3.0
      return middlewares[token].reduce<() => T>(
        (p, c) => () => c(container, token, p),
        next
      )();
    } else {
      return next();
    }
  };
}
