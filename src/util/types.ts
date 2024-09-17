export type ToUnion<T> = T[keyof T];

export type IsAsyncFunction<T> = T extends (...args: any[]) => Promise<any>
  ? true
  : false;

export type Typeof<T> = T;
