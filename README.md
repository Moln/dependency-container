# Dependency-container

[![Build Status](https://travis-ci.org/Moln/dependency-container.svg?branch=master)](https://travis-ci.org/Moln/dependency-container) 
[![Coverage Status](https://coveralls.io/repos/github/Moln/dependency-container/badge.svg?branch=master)](https://coveralls.io/github/Moln/dependency-container?branch=master)
[![GitHub license](https://img.shields.io/github/license/Moln/dependency-container)](https://github.com/Moln/dependency-container)
[![npm](https://img.shields.io/npm/v/@moln/dependency-container.svg)](https://www.npmjs.com/@moln/dependency-container)

A lightweight dependency injection container for TypeScript/JavaScript for
constructor injection.

- [Installation](#installation)
- [API](#api)
  - [Decorators](#decorators)
    - [injection()](#injection)
    - [inject()](#inject)
  - [DependencyContainer](#dependencycontainer)
    - [Injection Token](#injection-token)
    - [Provider](#provider)
    - [Registers](#registers)
    - [Factories](#factories)
  - [Middleware](#Middleware)
    - [matchmiddleware](#matchmiddleware)

## Installation

Install by `npm`

```sh
npm install --save @moln/dependency-container
```

**or** install with `yarn` (this project is developed using `yarn`)

```sh
yarn add @moln/dependency-container
```

Modify your `tsconfig.json` to include the following settings

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Add a polyfill for the Reflect API (examples below use reflect-metadata). You can use:

- [reflect-metadata](https://www.npmjs.com/package/reflect-metadata)
- [core-js (core-js/es7/reflect)](https://www.npmjs.com/package/core-js)
- [reflection](https://www.npmjs.com/package/@abraham/reflection)

The Reflect polyfill import should only be added once, and before DI is used:

```typescript
// main.ts
import "reflect-metadata";

// Your code here...
```

## API

### Decorators

#### injection()

Class decorator factory that allows the class' dependencies to be injected at runtime. 

##### usage

```typescript
// foo.ts
import {injection} from "@moln/dependency-container";

@injection()
export class Foo {
  constructor(private database: Database) {}
}

// some other file
const container = new DependencyContainer();
container.configure({
  abstractFactories: [[new ReflectionBasedAbstractFactory()]],
});

const instance = container.get(Foo);
```

#### inject()

Parameter decorator factory that allows for interface and other non-class information to be stored in the constructor's metadata.

##### usage

```typescript
// foo.ts
import {injection} from "@moln/dependency-container";

@injection()
class Foo {
  constructor(@inject('bar') private bar: Bar) {}
}

class Bar {
  constructor(name: string) {}
}

// some other file
const container = new DependencyContainer();
container.configure({
  abstractFactories: [[new ReflectionBasedAbstractFactory()]],
});

container.register('bar', () => new Bar('abc'));

const instance = container.get(Foo);
```

### DependencyContainer

#### Injection Token

A token may be either a string, a symbol or a class constructor.

```typescript
type InjectionToken<T = any> = constructor<T> | string | symbol;
```

#### Provider 

Our container has the notion of a provider. A provider is registered with the DI container and provides the container the information needed to resolve an instance for a given token.

```typescript
type FactoryFunction<T> = (
  container: DependencyContainerInterface,
  token: InjectionToken<T>
) => T;

interface Provider<T = any> {
  factory: FactoryFunction<T>;
  lifecycle: Lifecycle;
  instance?: T;
}
```


#### Registers

```typescript
const container = new DependencyContainer();
container.register(Foo, () => new Foo()); // Register by factory
container.register(Foo, {factory: () => new Foo(), lifecycle: Lifecycle.SINGLETON}); // Full provider config

container.registerSingleton(Foo);
container.registerSingleton('MyFoo', Foo);

container.registerInstance(Bar, new Bar());
container.registerInstance('MyBar', new Bar());
```

#### Factories

##### reflectionFactory & reflectionFactoryFrom

```typescript
const container = new DependencyContainer();

container.register(Foo, reflectionFactory);
container.register("MyBar", reflectionFactoryFrom(Bar));
```

##### aliasFactory

```typescript
const container = new DependencyContainer();

container.register(Foo, () => new Foo);
container.register('aliasFoo', aliasFactory(Foo));
container.register('aliasFoo2', aliasFactory('aliasFoo'));

container.get(Foo) === container.get('aliasFoo')
```

##### ReflectionBasedAbstractFactory

Register (default) singleton reflection abstract factory.

```typescript
const container = new DependencyContainer();
container.configure({
  abstractFactories: [[new ReflectionBasedAbstractFactory()]],
});

@injection()
class Foo {
  constructor(private bar: Bar) {}
}

class Bar {
  constructor() {}
}

const instance = container.get(Foo)
```

Register transient reflection abstract factory.

```typescript
const container = new DependencyContainer();
container.configure({
  abstractFactories: [[new ReflectionBasedAbstractFactory(), Lifecycle.TRANSIENT]],
});

@injection()
class Foo {
  constructor(private bar: Bar) {}
}

class Bar {
  constructor() {}
}

const foo1 = container.get(Foo);
const foo2 = container.get(Foo);

foo1 !== foo2 // true
```

#### Middleware

When active the service. Middlewares will be call. 

```typescript
const container = new DependencyContainer();
const loggerMiddleware: ServiceMiddleware = (container, token, next) => {
 console.log('Start ' + (token.name || token))
 const instance = next();
 console.log('End ' + (token.name || token))
 return instance;
}

container.use(loggerMiddleware)

class Foo {}

container.registerSingleton(Foo)

const foo = container.get(Foo);
// console output:
// Start foo
// End foo

const foo = container.get(Foo); 
// Foo is singleton, never be call middleware.
```

##### matchMiddleware

```typescript
const container = new DependencyContainer();
const loggerMiddleware: ServiceMiddleware = (container, token, next) => {
 console.log('Start ' + (token.name || token))
 const instance = next();
 console.log('End ' + (token.name || token))
 return instance;
}

container.use(matchMiddleware(Foo, [loggerMiddleware]))

class Foo {}
class Bar {}

container.registerSingleton(Foo)
container.registerSingleton(Bar)

const foo = container.get(Foo);
// console output:
// Start foo
// End foo

const bar = container.get(Bar); 
// Not matched, never be call `loggerMiddleware`.
```
