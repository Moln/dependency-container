import DependencyContainer, {
  aliasFactory,
  Lifecycle,
  ReflectionBasedAbstractFactory,
} from '../src';
import { RandomValue } from './classes';

describe('Factories', () => {
  it('Test call', () => {
    const abstractFactory = new ReflectionBasedAbstractFactory();

    const di = new DependencyContainer();

    expect(abstractFactory.canCreate(di, RandomValue)).toBeTruthy();
    expect(abstractFactory.factory(di, RandomValue)).toBeInstanceOf(
      RandomValue
    );

    expect(abstractFactory.canCreate(di, 'string')).toBeFalsy();
    expect(abstractFactory.canCreate(di, Symbol())).toBeFalsy();
  });

  it('Test DI singleton usage', () => {
    const abstractFactory = new ReflectionBasedAbstractFactory();

    const di = new DependencyContainer();
    di.configure({
      abstractFactories: [[abstractFactory, Lifecycle.SINGLETON]],
    });

    const result = di.get(RandomValue);
    const result2 = di.get(RandomValue);

    expect(result).toBeInstanceOf(RandomValue);
    expect(result).toEqual(result2);
  });

  it('Test DI transient usage', () => {
    const abstractFactory = new ReflectionBasedAbstractFactory();

    const di = new DependencyContainer();
    di.configure({
      abstractFactories: [[abstractFactory, Lifecycle.TRANSIENT]],
    });

    const result = di.get(RandomValue);
    const result2 = di.get(RandomValue);

    expect(result).toBeInstanceOf(RandomValue);
    expect(result2).toBeInstanceOf(RandomValue);
    expect(result).not.toEqual(result2);
  });

  it('should alias name', function() {
    const di = new DependencyContainer();
    di.registerSingleton(RandomValue);
    di.register('random-alias', {
      factory: aliasFactory(RandomValue),
      lifecycle: Lifecycle.SINGLETON,
    });

    expect(di.get(RandomValue)).toStrictEqual(di.get('random-alias'));
  });
});
