import DependencyContainer, {
  inject,
  injection,
  METADATA,
  ReflectionBasedAbstractFactory,
} from '../src';
import RandomValue from './RandomValue';

describe('Decorators', () => {
  it('Test @injection singleton', () => {
    @injection()
    class Bar {
      public value: string = 'bar';
    }

    @injection()
    class Foo {
      constructor(public myBar: Bar) {}
    }

    const di = new DependencyContainer();

    di.configure({
      abstractFactories: [[new ReflectionBasedAbstractFactory(), true]],
    });

    const obj = di.get(Foo);

    expect(obj).toBeInstanceOf(Foo);
  });

  it('Test @inject', () => {
    @injection()
    class Bar {
      public value: string = 'bar';
    }

    @injection()
    class Foo {
      public bar: Bar;
      constructor(@inject('bar') myBar: Bar) {
        this.bar = myBar;
      }
    }

    const di = new DependencyContainer();

    const bar = new Bar();
    bar.value = 'abc';
    di.registerInstance('bar', bar);

    di.configure({
      abstractFactories: [[new ReflectionBasedAbstractFactory(), true]],
    });

    const obj = di.get(Foo);

    expect(obj).toBeInstanceOf(Foo);
    expect(obj.bar.value).toEqual('abc');
  });

  it('Test @injection transient', () => {
    @injection(false)
    class Bar {
      public value: string = 'bar';
    }

    @injection(false)
    class Foo {
      public bar: Bar;
      public value = new RandomValue();
      constructor(@inject('bar') myBar: Bar) {
        this.bar = myBar;
      }
    }

    const di = new DependencyContainer();

    const bar = new Bar();
    bar.value = 'abc';
    di.registerInstance('bar', bar);

    di.configure({
      abstractFactories: [
        [new ReflectionBasedAbstractFactory(METADATA.TRANSIENT), false],
      ],
    });

    const obj = di.get(Foo);
    const obj2 = di.get(Foo);

    expect(obj).toBeInstanceOf(Foo);
    expect(obj).not.toEqual(obj2);
    expect(obj.bar.value).toEqual('abc');
  });
});
