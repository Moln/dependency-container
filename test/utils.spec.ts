import DependencyContainer, {
  Lifecycle,
  matchMiddleware,
  ReflectionBasedAbstractFactory,
} from '../src';
import { Bar, Foo } from './classes';

describe('Utils', () => {
  it('matchedMiddleware', () => {
    const di = new DependencyContainer();

    di.configure({
      abstractFactories: [
        [new ReflectionBasedAbstractFactory(), Lifecycle.SINGLETON],
      ],
    });

    di.use(
      matchMiddleware(Bar, [
        (c, token, next) => {
          const instance = next();
          instance.value += '1';
          return instance;
        },
        (c, token, next) => {
          const instance = next();
          instance.value += '2';
          return instance;
        },
      ])
    );

    const bar = di.get(Bar);
    const foo = di.get(Foo);

    expect(bar.value).toBe('bar12');
    expect((foo as any).value).toBeUndefined();
  });
});
