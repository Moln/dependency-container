import { InjectionToken } from 'types';

export const METADATA_DESIGN_PARAM_TYPES = 'design:paramtypes';
export const METADATA_PARAM_TYPES = 'dependency:paramtypes';
export const METADATA_LIFECYCLE = 'dependency:lifecycle';

/** Constructor type */
export type Constructor<T> = new (...args: any[]) => T;

export interface Dictionary<T> {
  [key: string]: T;
}

export function getParamInfo(target: Constructor<any>): any[] {
  const params: any[] =
    Reflect.getMetadata(METADATA_DESIGN_PARAM_TYPES, target) || [];
  const injectionTokens: Dictionary<InjectionToken<any>> =
    Reflect.getOwnMetadata(METADATA_PARAM_TYPES, target) || {};
  Object.keys(injectionTokens).forEach(key => {
    params[+key] = injectionTokens[key];
  });

  return params;
}
