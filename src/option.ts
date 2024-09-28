import { ValueNotFoundError } from "./errors";
import { Err, Ok, Result } from "./result";

type Some<T> = { ok: true; value: T };

type None = { ok: false; value?: never };

export type Option<T> = (Some<T> | None) & OptionFunctions<T>;

interface OptionFunctions<T> {
  get: () => T;
  getOrElse: (defaultValue: T) => T;
  map: <U>(fn: (val: T) => U) => Option<U>;
  inspect: (fn: (val: T) => void) => Option<T>;
  isSome: () => this is Some<T>;
  isSomeAnd: (fn: (val: T) => boolean) => boolean;
  isNone: () => this is None;
  isNoneOr: (fn: (val: T) => boolean) => boolean;
  asSlice: () => T[] | [];
  expect: (msg: string) => T; // NOTE: use this method with caution
  unwrap: () => T;
  unwrapOr: (def: T) => T;
  unwrapOrElse: (fn: () => T) => T;
  mapOr: <U>(def: U, fn: (val: T) => U) => U;
  mapOrElse: <U>(def: () => U, fn: (val: T) => U) => U;
  okOr: <E>(err: E) => Result<T, E>;
  okOrElse: <E>(fn: () => E) => Result<T, E>;
  and: <U>(optionB: Option<U>) => Option<U>;
  andThen: <U>(fn: (val: T) => Option<U>) => Option<U>;
  or: (optionB: Option<T>) => Option<T>;
  orElse: (optFn: () => Option<T>) => Option<T>;
  xor: (optionB: Option<T>) => Option<T>;
  zip: <U>(other: Option<U>) => Option<[T, U]>;
  zipWith: <U, V>(
    other: Option<U>,
    fn: (current: T, other: U) => V
  ) => Option<V>;
}

class OptionClass<T> implements OptionFunctions<T> {
  readonly value!: T;
  readonly ok!: boolean;

  constructor(ok: boolean, value?: T) {
    this.ok = ok;
    if (value && ok) {
      this.value = value;
    }
  }

  get() {
    if (this.ok) {
      return this.value;
    }
    throw new Error("value not found");
  }

  getOrElse(defaultValue: T) {
    if (this.ok) {
      return this.value;
    }
    return defaultValue;
  }

  map<U>(fn: (val: T) => U): Option<U> {
    if (this.ok) {
      const result = fn(this.value);
      return Some(result);
    }
    return None();
  }

  inspect(fn: (val: T) => void): Option<T> {
    if (this.ok) {
      fn(this.value);
      return Some(this.value);
    }
    return None();
  }

  isSome(): this is Some<T> {
    return this.ok;
  }

  isNone(): this is None {
    return !this.isSome();
  }

  isSomeAnd(fn: (val: T) => boolean): boolean {
    if (this.isNone()) {
      return false;
    }
    return fn(this.value);
  }

  isNoneOr(fn: (val: T) => boolean): boolean {
    if (this.isSome()) {
      return fn(this.value);
    }
    return true;
  }

  asSlice(): T[] | [] {
    if (this.isNone()) {
      return [];
    }
    return [this.value];
  }

  expect(msg: string): T {
    if (this.isNone()) {
      throw new ValueNotFoundError(msg);
    }
    return this.value;
  }

  unwrap(): T {
    if (this.isNone()) {
      throw new ValueNotFoundError();
    }
    return this.value;
  }

  unwrapOr(def: T): T {
    if (this.isNone()) {
      return def;
    }
    return this.value;
  }

  unwrapOrElse(fn: () => T): T {
    if (this.isNone()) {
      return fn();
    }
    return this.value;
  }

  mapOr<U>(def: U, fn: (val: T) => U): U {
    if (this.isNone()) {
      return def;
    }
    return fn(this.value);
  }

  mapOrElse<U>(def: () => U, fn: (val: T) => U): U {
    if (this.isNone()) {
      return def();
    }
    return fn(this.value);
  }

  okOr<E>(err: E): Result<T, E> {
    if (this.isNone()) {
      return Err(err);
    }
    return Ok(this.value);
  }

  okOrElse<E>(fn: () => E): Result<T, E> {
    if (this.isNone()) {
      return Err(fn());
    }
    return Ok(this.value);
  }

  and<U>(optionB: Option<U>): Option<U> {
    if (this.isNone()) {
      return None();
    }
    return optionB;
  }

  andThen<U>(fn: (val: T) => Option<U>): Option<U> {
    if (this.isNone()) {
      return None();
    }
    return fn(this.value);
  }

  or(optionB: Option<T>): Option<T> {
    if (this.isNone()) {
      return optionB;
    }
    return Some(this.value);
  }

  orElse(optFn: () => Option<T>): Option<T> {
    if (this.isNone()) {
      return optFn();
    }
    return Some(this.value);
  }

  xor(optionB: Option<T>): Option<T> {
    if (this.isNone() && optionB.isSome()) {
      return optionB;
    }
    if (this.isSome() && optionB.isNone()) {
      return Some(this.value);
    }
    return None();
  }

  zip<U>(other: Option<U>): Option<[T, U]> {
    if (this.isNone() || other.isNone()) {
      return None();
    }
    return Some([this.value, other.value]);
  }

  zipWith<U, V>(other: Option<U>, fn: (current: T, other: U) => V): Option<V> {
    if (this.isNone() || other.isNone()) {
      return None();
    }
    return Some(fn(this.value, other.value));
  }
}

export const Some = <T>(value: T): Option<T> => {
  const option = Object.create(OptionClass.prototype);
  option.ok = true;
  option.value = value;
  return option;
};

export const None = <T>(): Option<T> => {
  const option = Object.create(OptionClass.prototype);
  option.ok = false;
  option.value = false;
  return option;
};

// unzip helps separate the Option<[T, U]> into two separate values [Option<T>, Option<U>]
export const unzip = <T, U>(option: Option<[T, U]>): [Option<T>, Option<U>] => {
  if (option.isNone()) {
    return [None(), None()];
  }
  return [Some(option.value[0]), Some(option.value[1])];
};

// transpose helps to turn an Option<Result<T, E>> into an Result<Option<T>, E>
export const transpose = <T, E>(
  option: Option<Result<T, E>>
): Result<Option<T>, E> => {
  if (option.isNone()) {
    return Ok(None());
  }
  if (option.value.isOk()) {
    return Ok(Some(option.value.data));
  }
  return Err(option.value.err);
};

// flatten helps remove one layer of Option at a time
export const flatten = <T>(option: Option<Option<T>>): Option<T> => {
  if (option.isNone() || option.value.isNone()) {
    return None();
  }
  return Some(option.value.value);
};
