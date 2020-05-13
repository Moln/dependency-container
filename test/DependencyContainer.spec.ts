import DependencyContainer, {
  reflectionFactory,
  ReflectionBasedAbstractFactory,
} from '../src';
import { FactoryFunction, InjectionToken } from '../src/types';
import RandomValue from './RandomValue';

describe('DependencyContainerInterface', () => {
  it('Test configure', () => {
    const di = new DependencyContainer();
    di.configure({
      services: new Map<InjectionToken, any>([
        ['test-service1', new RandomValue()],
      ]),
      singletonFactories: new Map<InjectionToken, FactoryFunction<any>>([
        [RandomValue, reflectionFactory],
      ]),
    });
    const result = di.get<RandomValue>('test-service1');
    const result2 = di.get<RandomValue>('test-service1');
    const result3 = di.get<RandomValue>(RandomValue);
    const result4 = di.get<RandomValue>(RandomValue);

    expect(result).toEqual(result2);
    expect(result2).not.toEqual(result3);
    expect(result3).toEqual(result4);
  });

  it('Test pipe middleware', () => {
    const di = new DependencyContainer();
    di.configure({
      abstractFactories: [[new ReflectionBasedAbstractFactory(), true]],
    });
    expect.assertions(3);

    di.pipe<any>((container, token, next) => {
      expect(token).toEqual(RandomValue);
      return next();
    });
    di.pipe<any>((container, token, next) => {
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
      singleton: true,
    });
    di.registerSingleton(RandomValue);
    di.registerInstance('test instance', instance);

    const objTestSingleton = di.get(RandomValue);
    const objTestSingleton2 = di.get(RandomValue);
    const objTestInstance = di.get('test instance');
    const objTestRegister = di.get('test register factory');
    const objTestRegister2 = di.get('test register factory');

    expect(objTestSingleton).toBeInstanceOf(RandomValue);
    expect(objTestSingleton).toEqual(objTestSingleton2);
    expect(objTestInstance).toEqual(instance);
    expect(objTestRegister).toBeInstanceOf(RandomValue);
    expect(objTestRegister).toEqual(objTestRegister2);
  });

  it('Test register/get as transient', () => {
    const di = new DependencyContainer();
    const id = Symbol();
    di.register('test', {
      factory: () => new RandomValue(),
      singleton: false,
    });

    di.register(id, {
      factory: () => new RandomValue(),
      singleton: false,
    });

    di.register(RandomValue, {
      factory: () => new RandomValue(),
      singleton: false,
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
});
