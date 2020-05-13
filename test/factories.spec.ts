import DependencyContainer, { ReflectionBasedAbstractFactory } from '../src';
import RandomValueSpec from './RandomValue';

describe('ReflectionBasedAbstractFactory', () => {
  it('Test call', () => {
    const abstractFactory = new ReflectionBasedAbstractFactory();

    const di = new DependencyContainer();

    expect(abstractFactory.canCreate(di, RandomValueSpec)).toBeTruthy();
    expect(abstractFactory.factory(di, RandomValueSpec)).toBeInstanceOf(
      RandomValueSpec
    );

    expect(abstractFactory.canCreate(di, 'string')).toBeFalsy();
    expect(abstractFactory.canCreate(di, Symbol())).toBeFalsy();
  });

  it('Test DI singleton usage', () => {
    const abstractFactory = new ReflectionBasedAbstractFactory();

    const di = new DependencyContainer();
    di.configure({
      abstractFactories: [[abstractFactory, true]],
    });

    const result = di.get(RandomValueSpec);
    const result2 = di.get(RandomValueSpec);

    expect(result).toBeInstanceOf(RandomValueSpec);
    expect(result).toEqual(result2);
  });

  it('Test DI transient usage', () => {
    const abstractFactory = new ReflectionBasedAbstractFactory();

    const di = new DependencyContainer();
    di.configure({
      abstractFactories: [[abstractFactory, false]],
    });

    const result = di.get(RandomValueSpec);
    const result2 = di.get(RandomValueSpec);

    expect(result).toBeInstanceOf(RandomValueSpec);
    expect(result2).toBeInstanceOf(RandomValueSpec);
    expect(result).not.toEqual(result2);
  });
});
