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
    if (!this.ok) {
      return None();
    }
    return Some(this.data);
  }

  toErr(): Option<U> {
    if (this.ok) {
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
