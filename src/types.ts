import { Lifecycle } from './DependencyContainer';
import { Constructor } from './internal';

export type InjectionToken<T = any> = Constructor<T> | string | symbol;

export interface Provider<T = any> {
  factory: FactoryFunction<T>;
  lifecycle: Lifecycle;
  instance?: T;
}

export type FactoryFunction<T> = (
  container: DependencyContainerInterface,
  token: InjectionToken<T>
) => T;

export interface AbstractFactoryInterface<T = any> {
  canCreate: (
    container: DependencyContainerInterface,
    token: InjectionToken<T>
  ) => boolean;
  factory: FactoryFunction<T>;
}

export interface DependencyContainerInterface {
  register<T>(
    token: InjectionToken<T>,
    provider: Provider
  ): DependencyContainerInterface;

  registerSingleton<T>(
    from: InjectionToken<T>,
    to: Constructor<T>
  ): DependencyContainerInterface;
  registerSingleton<T>(from: Constructor<T>): DependencyContainerInterface;
  registerSingleton<T>(
    from: InjectionToken<T>,
    to?: Constructor<T>
  ): DependencyContainerInterface;

  registerInstance<T>(
    token: InjectionToken<T>,
    instance: T
  ): DependencyContainerInterface;

  get<T>(token: InjectionToken<T>): T;

  has<T>(token: InjectionToken<T>): boolean;

  reset(): void;

  createChildContainer(): DependencyContainerInterface;

  use<T>(middleware: ServiceMiddleware<T>): void;
}

export type ServiceMiddleware<T> = (
  container: DependencyContainerInterface,
  token: InjectionToken<T>,
  next: () => T
) => T;

export interface DependencyConfigInterface {
  services?: Map<InjectionToken, any>;
  invokables?: Array<Constructor<any>>;
  singletonFactories?: Map<InjectionToken, FactoryFunction<any>>;
  transientFactories?: Map<InjectionToken, FactoryFunction<any>>;
  abstractFactories?: Array<[AbstractFactoryInterface, Lifecycle]>;
  activationMiddlewares?: Map<InjectionToken, Array<ServiceMiddleware<any>>>;
}
