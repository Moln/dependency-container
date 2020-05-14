import { InjectionToken, ServiceMiddleware } from './types';

export function isNormalToken(
  token?: InjectionToken<any>
): token is string | symbol {
  return typeof token === 'string' || typeof token === 'symbol';
}

export function matchMiddleware<T>(
  validToken: InjectionToken<T>,
  middlewares: ServiceMiddleware<T>[]
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

// export function matchServiceMiddlewares<T>(
//   validToken: InjectionToken<T>,
//   middlewares: Map<InjectionToken<T>, ServiceMiddleware<T>[]>
// ): ServiceMiddleware<T> {
//   return (container, token, next) => {
//
//     if (middlewares.has(token)) {
//       const m = middlewares.get(token) as ServiceMiddleware<T>[];
//       return m.reduce<() => T>(
//           (p, c) => () => c(container, token, p),
//           next
//       )();
//     }
//
//     return next();
//   };
// }
