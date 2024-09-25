type Some<T> = { ok: true; value: T };

type None = { ok: false; value?: never };

export type Option<T> = (Some<T> | None) & OptionFunctions<T>;

interface OptionFunctions<T> {
  get: () => T;
  getOrElse: (defaultValue: T) => T;
  map: <U>(fn: (val: T) => U) => Option<U>;
  inspect: (fn: (val: T) => void) => Option<T>;
  isSome: () => this is Some<T>;
  isNone: () => this is None;
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
