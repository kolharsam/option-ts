# option-ts

This library provides Rust-inspired `Option` and `Result` types for TypeScript, enabling more robust error handling and null safety in your TypeScript projects.

## Installation

```bash
npm install @kolharsam/option-ts
```

## Usage

### Option

```typescript
import { Option, Some, None } from '@kolharsam/option-ts';

const someValue: Option<number> = Some(5);
const noneValue: Option<number> = None();

console.log(someValue.isSome()); // true
console.log(noneValue.isNone()); // true

const doubled = someValue.map(x => x * 2);
console.log(doubled.get()); // 10

const safeDiv = (a: number, b: number): Option<number> => {
  if (b === 0) return None();
  return Some(a / b);
};

console.log(safeDiv(10, 2).getOrElse(0)); // 5
console.log(safeDiv(10, 0).getOrElse(0)); // 0
```

### Result

```typescript
import { Result, Ok, Err } from '@kolharsam/option-ts';

const okResult: Result<number, string> = Ok(5);
const errResult: Result<number, string> = Err("An error occurred");

console.log(okResult.isOk()); // true
console.log(errResult.isErr()); // true

const doubled = okResult.map(x => x * 2);
console.log(doubled.toOk().get()); // 10

const safeDiv = (a: number, b: number): Result<number, string> => {
  if (b === 0) return Err("Division by zero");
  return Ok(a / b);
};

console.log(safeDiv(10, 2).toOk().getOrElse(0)); // 5
console.log(safeDiv(10, 0).toErr().get()); // "Division by zero"
```

## API Reference

### Option<T>

- `Some<T>(value: T): Option<T>`
- `None<T>(): Option<T>`
- `get(): T`
- `getOrElse(defaultValue: T): T`
- `map<U>(fn: (val: T) => U): Option<U>`
- `inspect(fn: (val: T) => void): Option<T>`
- `isSome(): boolean`
- `isNone(): boolean`

### Result<T, E>

- `Ok<T, E>(value: T): Result<T, E>`
- `Err<T, E>(error: E): Result<T, E>`
- `isOk(): boolean`
- `isOkAnd(fn: (val: T) => boolean): boolean`
- `isErr(): boolean`
- `isErrAnd(fn: (val: E) => boolean): boolean`
- `toOk(): Option<T>`
- `toErr(): Option<E>`
- `inspect(fn: (val: T) => void): Result<T, E>`
- `inspectErr(fn: (val: E) => void): Result<T, E>`
- `map<U>(fn: (val: T) => U): Result<U, E>`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
