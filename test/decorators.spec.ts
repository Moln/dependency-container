import DependencyContainer, {
  Lifecycle,
  inject,
  injectable,
  ReflectionBasedAbstractFactory,
  createContainer,
} from '../src';
import { Bar, Baz, Foo, RandomValue } from './classes';

describe('Decorators', () => {
  it('Test @injectable singleton', () => {
    const di = createContainer();

    const obj = di.get(Foo);

    expect(obj).toBeInstanceOf(Foo);
  });

  it('Test @inject', () => {
    const di = createContainer();

    const bar = new Bar();
    bar.value = 'abc';
    di.registerInstance('bar', bar);

    const obj = di.get(Baz);

    expect(obj).toBeInstanceOf(Baz);
    expect(obj.bar.value).toEqual('abc');
  });

  it('Test @injectable transient', () => {
    @injectable(Lifecycle.TRANSIENT)
    class Bar {
      constructor(public value: string = 'bar') {}
    }

    @injectable(Lifecycle.TRANSIENT)
    class Foo {
      public bar: Bar;
      public value = new RandomValue();
      constructor(@inject('bar') myBar: Bar) {
        this.bar = myBar;
      }
    }

    const di = new DependencyContainer();

    const bar = new Bar('abc');
    di.registerInstance('bar', bar);

    di.configure({
      abstractFactories: [
        [
          new ReflectionBasedAbstractFactory(Lifecycle.TRANSIENT),
          Lifecycle.TRANSIENT,
        ],
      ],
    });

    const obj = di.get(Foo);
    const obj2 = di.get(Foo);

    expect(obj).toBeInstanceOf(Foo);
    expect(obj).not.toEqual(obj2);
    expect(obj.bar.value).toEqual('abc');
  });
});
