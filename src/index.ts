import DependencyContainer from './DependencyContainer';
if (process.env.NODE_ENV !== 'production') {
  if (typeof Reflect === 'undefined' || !Reflect.getMetadata) {
    throw new Error(
      `tsyringe requires a reflect polyfill. Please add 'import "reflect-metadata"' to the top of your entry point.`
    );
  }
}

export * from './decorators';
export * from './factories';
export * from './middlewares';

export default DependencyContainer;
