import {
  DependencyContainerInterface,
  FactoryFunction,
  InjectionToken,
  AbstractFactoryInterface,
} from './types';
import { isNormalToken } from './';
import { METADATA_LIFECYCLE, getParamInfo, Constructor } from './internal';
import { Lifecycle } from './DependencyContainer';

export function aliasFactory<T>(token: InjectionToken<T>): FactoryFunction<T> {
  return container => container.get(token);
}

export const reflectionFactory: FactoryFunction<any> = <T>(
  container: DependencyContainerInterface,
  token: InjectionToken<T>
) => {
  if (isNormalToken(token)) {
    throw new Error('Invalid token');
  }

  if (token.length === 0) {
    return new token();
  }

  const paramInfo = getParamInfo(token);

  if (!paramInfo || paramInfo.length === 0) {
    throw new Error(`TypeInfo not known for ${token}`);
  }

  const params = paramInfo.map(param => container.get(param));

  return new token(...params);
};

export function reflectionFactoryFrom<T>(
  ctor: Constructor<T>
): FactoryFunction<T> {
  return (container: DependencyContainerInterface) =>
    reflectionFactory(container, ctor);
}

export class ReflectionBasedAbstractFactory<T = any>
  implements AbstractFactoryInterface<T> {
  private readonly lifecycleScope: Lifecycle | undefined;

  constructor(lifecycleScope?: Lifecycle) {
    this.lifecycleScope = lifecycleScope;
  }

  public canCreate(
    container: DependencyContainerInterface,
    token: InjectionToken<T>
  ): boolean {
    if (typeof token !== 'function') {
      return false;
    }

    if (this.lifecycleScope === undefined) {
      return true;
    } else {
      return (
        Reflect.getOwnMetadata(METADATA_LIFECYCLE, token) ===
        this.lifecycleScope
      );
    }
  }

  public factory = reflectionFactory;
}
