import { inject, injection } from '../src';

export class RandomValue {
  public value = Math.random();
}

@injection()
export class Bar {
  public value: string = 'bar';
}

@injection()
export class Foo {
  constructor(public myBar: Bar) {}
}

@injection()
export class Baz {
  public bar: Bar;
  constructor(@inject('bar') myBar: Bar) {
    this.bar = myBar;
  }
}

export const TRANSIENT = {};
