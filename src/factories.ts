import {
  DependencyContainerInterface,
  Constructor,
  FactoryFunction,
  InjectionToken,
  Dictionary,
  AbstractFactoryInterface,
} from './types';
import { METADATA } from './';

export function isNormalToken(
  token?: InjectionToken<any>
): token is string | symbol {
  return typeof token === 'string' || typeof token === 'symbol';
}

export function aliasFactory<T>(token: InjectionToken<T>): FactoryFunction<T> {
  return container => container.get(token);
}

export const reflectionFactory: FactoryFunction<any> = (
  container: DependencyContainerInterface,
  token: InjectionToken<any>
) => {
  if (typeof token !== 'function') {
    throw new Error('Invalid token');
  }

  return reflectionFactoryFrom(token)(container, token);
};

export function reflectionFactoryFrom<T>(
  ctor: Constructor<T>
): FactoryFunction<T> {
  return (container: DependencyContainerInterface) => {
    if (ctor.length === 0) {
      return new ctor();
    }

    const paramInfo = getParamInfo(ctor);

    if (!paramInfo || paramInfo.length === 0) {
      throw new Error(`TypeInfo not known for ${ctor}`);
    }

    const params = paramInfo.map(param => container.get(param));

    return new ctor(...params);
  };
}

export function getParamInfo(target: Constructor<any>): any[] {
  const params: any[] =
    Reflect.getMetadata(METADATA.DESIGN_PARAM_TYPES, target) || [];
  const injectionTokens: Dictionary<InjectionToken<any>> =
    Reflect.getOwnMetadata(METADATA.PARAM_TYPES, target) || {};
  Object.keys(injectionTokens).forEach(key => {
    params[+key] = injectionTokens[key];
  });

  return params;
}

export class ReflectionBasedAbstractFactory<T = any>
  implements AbstractFactoryInterface<T> {
  private readonly metaKey: string | undefined;

  constructor(metaKey?: string) {
    this.metaKey = metaKey;
  }

  public canCreate(
    container: DependencyContainerInterface,
    token: InjectionToken<T>
  ): boolean {
    if (typeof token !== 'function') {
      return false;
    }

    if (!this.metaKey) {
      return true;
    } else {
      return Reflect.getOwnMetadata(this.metaKey, token) === true;
    }
  }

  public factory(
    container: DependencyContainerInterface,
    token: InjectionToken<T>
  ): T {
    return reflectionFactoryFrom(token as Constructor<T>)(container, token);
  }
}
