import { inject, injectable } from '../src';

export class RandomValue {
  public value = Math.random();
}

@injectable()
export class Bar {
  public value: string = 'bar';
}

@injectable()
export class Foo {
  constructor(public myBar: Bar) {}
}

@injectable()
export class Baz {
  public bar: Bar;
  constructor(@inject('bar') myBar: Bar) {
    this.bar = myBar;
  }
}

export const TRANSIENT = {};
