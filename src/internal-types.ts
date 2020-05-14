/** Constructor type */
export type Constructor<T> = new (...args: any[]) => T;

export interface Dictionary<T> {
  [key: string]: T;
}
