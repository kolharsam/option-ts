import { ValueError } from "./errors";
import { None, Option, Some } from "./option";

type Ok<T> = { ok: true; data: T };

type Err<U> = { ok: false; err: U };

export type Result<T, U> = (Err<U> | Ok<T>) & ResultFunctions<T, U>;

interface ResultFunctions<T, U> {
  isOk: () => this is Ok<T>;
  isOkAnd: (fn: (val: T) => boolean) => boolean;
  isErr: () => this is Err<U>;
  isErrAnd: (fn: (val: U) => boolean) => boolean;
  toOk: () => Option<T>;
  toErr: () => Option<U>;
  inspect: (f: (val: T) => void) => Result<T, U>;
  inspectErr: (f: (val: U) => void) => Result<T, U>;
  map: <V>(f: (val: T) => V) => Result<V, U>;
  mapOr: <V>(def: V, f: (val: T) => V) => V;
  mapErr: <E>(fn: (err: U) => E) => Result<T, E>;
  expect: (msg: string) => T;
  unwrap: () => T;
  unwrapOrDefault: (def: T) => T;
  expectErr: (msg: string) => U;
  unwrapErr: () => U;
  and: <V>(res: Result<V, U>) => Result<V, U>;
  andThen: <V>(op: (val: T) => Result<V, U>) => Result<V, U>;
  or: <E>(res: Result<T, E>) => Result<T, E>;
  orElse: <E>(op: (err: U) => Result<T, E>) => Result<T, E>;
  unwrapOr: (def: T) => T;
  unwrapOrElse: (op: (err: U) => T) => T;
}

class ResultClass<T, U> implements ResultFunctions<T, U> {
  readonly data!: T;
  readonly err!: U;
  readonly ok!: boolean;

  constructor(ok: boolean, value?: T, err?: U) {
    this.ok = ok;
    if (value && ok) {
      this.data = value;
    }
    if (!ok && err) {
      this.err = err;
    }
  }

  isOk(): this is Ok<T> {
    return this.ok;
  }

  isOkAnd(fn: (val: T) => boolean): boolean {
    if (!this.ok) {
      return false;
    }
    return fn(this.data);
  }

  isErr(): this is Err<U> {
    return !this.ok;
  }

  isErrAnd(fn: (val: U) => boolean): boolean {
    if (this.ok) {
      return false;
    }
    return fn(this.err);
  }

  toOk(): Option<T> {
    if (this.isErr()) {
      return None();
    }
    return Some(this.data);
  }

  toErr(): Option<U> {
    if (this.isOk()) {
      return None();
    }
    return Some(this.err);
  }

  inspect(fn: (val: T) => void): Result<T, U> {
    if (!this.ok) {
      return Err(this.err);
    }
    fn(this.data);
    return Ok(this.data);
  }

  inspectErr(fn: (val: U) => void): Result<T, U> {
    if (this.ok) {
      return Ok(this.data);
    }
    fn(this.err);
    return Err(this.err);
  }

  map<V>(fn: (val: T) => V): Result<V, U> {
    if (!this.ok) {
      return Err(this.err);
    }
    const mapResult = fn(this.data);
    return Ok(mapResult);
  }

  mapOr<V>(def: V, fn: (val: T) => V): V {
    if (this.isErr()) {
      return def;
    }
    return fn(this.data);
  }

  mapOrElse<V>(def: (err: U) => V, fn: (val: T) => V): V {
    if (this.isErr()) {
      return def(this.err);
    }
    return fn(this.data);
  }

  mapErr<E>(op: (err: U) => E): Result<T, E> {
    if (this.isOk()) {
      return Ok(this.data);
    }
    return Err(op(this.err));
  }

  expect(msg: string): T {
    if (this.isErr()) {
      throw new ValueError(msg);
    }
    return this.data;
  }

  unwrap(): T {
    if (this.isErr()) {
      throw new ValueError();
    }
    return this.data;
  }

  unwrapOrDefault(def: T): T {
    if (this.isErr()) {
      return def;
    }
    return this.data;
  }

  expectErr(msg: string): U {
    if (this.isOk()) {
      throw new ValueError(msg);
    }
    return this.err;
  }

  unwrapErr(): U {
    if (this.isOk()) {
      throw new ValueError("");
    }
    return this.err;
  }

  and<V>(res: Result<V, U>): Result<V, U> {
    if (this.isErr()) {
      return Err(this.err);
    }
    return res;
  }

  andThen<V>(op: (val: T) => Result<V, U>): Result<V, U> {
    if (this.isErr()) {
      return Err(this.err);
    }
    return op(this.data);
  }

  or<E>(res: Result<T, E>): Result<T, E> {
    if (this.isErr()) {
      return res;
    }
    return Ok(this.data);
  }

  orElse<E>(op: (err: U) => Result<T, E>): Result<T, E> {
    if (this.isErr()) {
      return op(this.err);
    }
    return Ok(this.data);
  }

  unwrapOr(def: T): T {
    if (this.isErr()) {
      return def;
    }
    return this.data;
  }

  unwrapOrElse(op: (err: U) => T): T {
    if (this.isErr()) {
      return op(this.err);
    }
    return this.data;
  }
}

export const Ok = <T, U>(value: T): Result<T, U> => {
  const result = Object.create(ResultClass.prototype);
  result.ok = true;
  result.data = value;
  return result;
};

export const Err = <T, U>(err: U): Result<T, U> => {
  const result = Object.create(ResultClass.prototype);
  result.ok = false;
  result.err = err;
  return result;
};

export const transpose = <T, E>(
  res: Result<Option<T>, E>
): Option<Result<T, E>> => {
  if (res.isOk() && res.data.isNone()) {
    return None();
  }
  if (res.isOk() && res.data.isSome()) {
    return Some(Ok(res.data.value));
  }
  if (res.isErr()) {
    return Some(Err(res.err));
  }
  return None(); // NOTE: this case will not be reached
};

export const flatten = <T, E>(res: Result<Result<T, E>, E>): Result<T, E> => {
  if (res.isErr()) {
    return Err(res.err);
  }
  if (res.isOk()) {
    if (res.data.isOk()) {
      return Ok(res.data.data);
    } else if (res.data.isErr()) {
      return Err(res.data.err);
    }
  }
  throw new Error("failed to flatten given result object");
};
