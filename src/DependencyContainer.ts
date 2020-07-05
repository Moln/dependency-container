import {
  InjectionToken,
  Provider,
  ServiceMiddleware,
  DependencyConfigInterface,
  DependencyContainerInterface,
  AbstractFactoryInterface,
  FactoryFunction,
} from './types';
import {
  isNormalToken,
  reflectionFactory,
  reflectionFactoryFrom,
  matchMiddleware,
  ReflectionBasedAbstractFactory,
} from './';
import { Constructor } from './internal';

const noop = () => {
  /* noop */
};

export enum Lifecycle {
  SINGLETON,
  TRANSIENT,
}

const SINGLETON = Lifecycle.SINGLETON;
const TRANSIENT = Lifecycle.TRANSIENT;

export default class DependencyContainer
  implements DependencyContainerInterface {
  private registry = new Map<InjectionToken, Provider>();

  private abstractFactories: Array<
    [AbstractFactoryInterface<any>, Lifecycle]
  > = [];

  private middlewares: Array<ServiceMiddleware<any>> = [];

  public constructor(private parent?: DependencyContainer) {}

  public configure(config: DependencyConfigInterface): void {
    if (config.services) {
      config.services.forEach((value, token) =>
        this.registerInstance(token, value)
      );
    }

    if (config.invokables) {
      config.invokables.forEach(ctor => this.registerSingleton(ctor));
    }

    if (config.singletonFactories) {
      config.singletonFactories.forEach((value, token) => {
        this.register(token, {
          factory: value,
          lifecycle: SINGLETON,
        });
      });
    }

    if (config.transientFactories) {
      config.transientFactories.forEach((value, token) => {
        this.register(token, {
          factory: value,
          lifecycle: TRANSIENT,
        });
      });
    }

    if (config.abstractFactories) {
      config.abstractFactories.forEach(factoryConfig => {
        this.abstractFactories.push(factoryConfig);
      });
    }

    if (config.activationMiddlewares) {
      config.activationMiddlewares.forEach((middlewares, token) => {
        this.use(matchMiddleware(token, middlewares));
      });
    }
  }

  public use<T>(middleware: ServiceMiddleware<T>): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Register a dependency provider.
   *
   * @param token {InjectionToken<T>}
   * @param provider {Provider|FactoryFunction<T>} The dependency provider
   */
  public register<T>(
    token: InjectionToken<T>,
    provider: Provider | FactoryFunction<T>
  ): DependencyContainerInterface {
    if (typeof provider == 'function') {
      provider = {
        factory: provider,
        lifecycle: SINGLETON,
      };
    }

    this.registry.set(token, provider);

    return this;
  }

  public registerInstance<T>(
    token: InjectionToken<T>,
    instance: T
  ): DependencyContainerInterface {
    return this.register(token, {
      factory: noop,
      lifecycle: SINGLETON,
      instance,
    });
  }

  public registerSingleton<T>(
    from: InjectionToken<T>,
    to: Constructor<T>
  ): DependencyContainerInterface;
  public registerSingleton<T>(
    token: Constructor<T>
  ): DependencyContainerInterface;
  public registerSingleton<T>(
    from: InjectionToken<T>,
    to?: Constructor<T>
  ): DependencyContainerInterface {
    if (isNormalToken(from)) {
      if (to) {
        return this.register<T>(from, {
          factory: reflectionFactoryFrom(to),
          lifecycle: SINGLETON,
        });
      } else {
        throw new Error('Invalid argument "to"');
      }
    }

    return this.register(from, {
      factory: reflectionFactory,
      lifecycle: SINGLETON,
    });
  }

  /**
   * Resolve a token into an instance
   *
   * @param token {InjectionToken} The dependency token
   * @return {T} An instance of the dependency
   */
  public get<T>(token: InjectionToken<T>): T {
    const provider = this.getRegistration(token);

    if (!provider) {
      const findOut = this.abstractFactories.some(
        ([abstractFactory, lifecycle]) => {
          const instance = abstractFactory.canCreate(this, token);

          if (!instance) {
            return false;
          }

          this.register(token, {
            factory: abstractFactory.factory,
            lifecycle,
          });

          return true;
        }
      );

      if (!findOut) {
        throw new Error(
          `Attempted to resolve unregistered dependency token: ${token.toString()}`
        );
      }

      return this.get(token);
    }

    if (provider.lifecycle === SINGLETON && provider.instance) {
      return provider.instance;
    }

    const factory = provider.factory;

    const call = this.middlewares.reduce<() => T>(
      (p, c) => () => c(this, token, p),
      () => factory(this, token)
    );

    const result = call();

    if (provider.lifecycle === SINGLETON) {
      provider.instance = result;
    }

    return result;
  }

  /**
   * Check if the given dependency is registered
   *
   * @return {boolean}
   */
  public has<T>(token: InjectionToken<T>): boolean {
    return (
      this.registry.has(token) ||
      ((this.parent || false) && this.parent.has(token))
    );
  }

  /**
   * Clears all registered tokens
   */
  public reset(): void {
    this.registry.clear();
  }

  public createChildContainer(): DependencyContainerInterface {
    return new DependencyContainer(this);
  }

  private getRegistration<T>(token: InjectionToken<T>): Provider<T> | null {
    if (this.registry.has(token)) {
      return this.registry.get(token)!;
    }

    if (this.parent) {
      return this.parent.getRegistration(token);
    }

    return null;
  }
}

export function createContainer() {
  const container = new DependencyContainer();
  container.configure({
    abstractFactories: [[new ReflectionBasedAbstractFactory(), SINGLETON]],
  });

  return container;
}
