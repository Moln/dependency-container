import DependencyContainer, {
  Lifecycle,
  ReflectionBasedAbstractFactory,
  reflectionFactory,
} from '../src';
import {
  FactoryFunction,
  InjectionToken,
  ServiceMiddleware,
} from '../src/types';
import { Bar, Foo, RandomValue } from './classes';

describe('DependencyContainerInterface', () => {
  it('Test configure', () => {
    const di = new DependencyContainer();

    const objA = new RandomValue();

    di.configure({
      invokables: [RandomValue],
      services: new Map<InjectionToken, any>([['test-instance', objA]]),
      singletonFactories: new Map<InjectionToken, FactoryFunction<any>>([
        [Foo, reflectionFactory],
      ]),
      transientFactories: new Map<InjectionToken, FactoryFunction<any>>([
        [Bar, reflectionFactory],
      ]),
      activationMiddlewares: new Map<InjectionToken, ServiceMiddleware<any>[]>([
        [Foo, [(c, t, next) => next()]],
        [Bar, [(c, t, next) => next()]],
      ]),
    });

    expect(di.get(RandomValue)).toBeInstanceOf(RandomValue); // From invokables
    expect(di.get(RandomValue)).toBe(di.get(RandomValue)); // From invokables
    expect(di.get('test-instance')).toBe(objA); // From services

    expect(di.get(Foo)).toBeInstanceOf(Foo); // From singletonFactories
    expect(di.get(Foo)).toBe(di.get(Foo)); // From singletonFactories
    expect(di.get(Bar)).not.toBe(di.get(Bar)); // From transientFactories
  });

  it('Test use middleware', () => {
    const di = new DependencyContainer();
    di.configure({
      abstractFactories: [
        [new ReflectionBasedAbstractFactory(), Lifecycle.SINGLETON],
      ],
    });
    expect.assertions(3);

    di.use<any>((container, token, next) => {
      expect(token).toEqual(RandomValue);
      return next();
    });
    di.use<any>((container, token, next) => {
      const result = next();
      expect(result).toBeInstanceOf(RandomValue);
      return result;
    });
    const obj = di.get(RandomValue);

    expect(obj).toBeInstanceOf(RandomValue);
  });

  it('Test register/get as singleton', () => {
    const di = new DependencyContainer();
    const instance = new RandomValue();

    di.register('test register factory', {
      factory: () => new RandomValue(),
      lifecycle: Lifecycle.SINGLETON,
    });
    di.register('test register simple factory', () => new RandomValue());

    di.registerSingleton(RandomValue);
    di.registerSingleton('string name service', RandomValue);
    di.registerInstance('test instance', instance);

    expect(di.get(RandomValue)).toBeInstanceOf(RandomValue);
    expect(di.get(RandomValue)).toBe(di.get(RandomValue));
    expect(di.get('test instance')).toBe(instance);
    expect(di.get('test register factory')).toBeInstanceOf(RandomValue);
    expect(di.get('test register factory')).toBe(
      di.get('test register factory')
    );
    expect(di.get('test register simple factory')).toBe(
      di.get('test register simple factory')
    );
    expect(di.get('string name service')).toBeInstanceOf(RandomValue);
    expect(di.get('string name service')).toBe(di.get('string name service'));
  });

  it('Test register/get as transient', () => {
    const di = new DependencyContainer();
    const id = Symbol();
    di.register('test', {
      factory: () => new RandomValue(),
      lifecycle: Lifecycle.TRANSIENT,
    });

    di.register(id, {
      factory: () => new RandomValue(),
      lifecycle: Lifecycle.TRANSIENT,
    });

    di.register(RandomValue, {
      factory: () => new RandomValue(),
      lifecycle: Lifecycle.TRANSIENT,
    });

    const obj11 = di.get('test');
    const obj12 = di.get('test');
    const obj21 = di.get(id);
    const obj22 = di.get(id);
    const obj31 = di.get(RandomValue);
    const obj32 = di.get(RandomValue);

    expect(obj11).not.toEqual(obj12);
    expect(obj21).not.toEqual(obj22);
    expect(obj31).not.toEqual(obj32);
  });

  it('should clear all', function() {
    const di = new DependencyContainer();
    di.registerSingleton(Foo);

    expect(di.has(Foo)).toBeTruthy();
    di.reset();

    expect(di.has(Foo)).toBeFalsy();
  });

  it('should child container', function() {
    const di = new DependencyContainer();
    di.registerSingleton(RandomValue);

    const di2 = di.createChildContainer();
    expect(di2.get(RandomValue)).toBeInstanceOf(RandomValue);
  });
});
