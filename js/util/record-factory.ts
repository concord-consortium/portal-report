// from https://blog.mgechev.com/2018/01/18/react-typescript-redux-immutable/

import { Record } from "immutable";

interface Constructable<T> {
  new (...args: any[]): T;
}

export interface StaticallyTypedRecord<T> extends Constructable<T> {
  get<K extends keyof T>(key: K): T[K];
  getIn<K1 extends keyof T, K2 extends keyof T[K1]>(keys: [K1, K2]): T[K1][K2];
  getIn<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(keys: [K1, K2, K3]): T[K1][K2][K3];
  set<K extends keyof T, V extends T[K]>(key: K, value: V): this;
  withMutations(cb: (r: StaticallyTypedRecord<T>) => StaticallyTypedRecord<T>): this;
  setIn<K1 extends keyof T, V extends T[K1]>(keys: [K1], val: V): this;
  setIn<K1 extends keyof T, K2 extends keyof T[K1], V extends T[K1][K2]>(keys: [K1, K2], val: V): this;
  setIn<K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], V extends T[K1][K2][K3]>(
    keys: [K1, K2, K3],
    val: V
  ): this;
  toJS(): T;
}

export const RecordFactory = <T>(seed: T): new (...args: any[]) => StaticallyTypedRecord<T> =>
  (Record(seed) as any) as new (...args: any[]) => StaticallyTypedRecord<T>;
