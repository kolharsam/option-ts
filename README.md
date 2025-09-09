# option-ts

This library provides Rust-inspired `Option` and `Result` types for TypeScript, enabling more robust error handling and null safety in your TypeScript projects.

## Installation

```bash
npm install @kolharsam/option-ts
```

## Usage

### Option

The `Option` type represents an optional value: every `Option` is either `Some` and contains a value, or `None`, and does not.

```typescript
import { Option, Some, None } from "@kolharsam/option-ts";

const someValue: Option<number> = Some(5);
const noneValue: Option<number> = None();

console.log(someValue.isSome()); // true
console.log(noneValue.isNone()); // true

// Transform values safely
const doubled = someValue.map((x) => x * 2);
console.log(doubled.get()); // 10

// Safe division function
const safeDiv = (a: number, b: number): Option<number> => {
  if (b === 0) return None();
  return Some(a / b);
};

console.log(safeDiv(10, 2).getOrElse(0)); // 5
console.log(safeDiv(10, 0).getOrElse(0)); // 0
```

#### Pattern Matching with `match`

Use `match` for elegant pattern matching on Option values:

```typescript
const result = someValue.match({
  Some: (value) => `Got value: ${value}`,
  None: () => "No value found",
});

// Real-world example: User greeting
const user = Some({ name: "Alice", age: 30 });
const greeting = user.match({
  Some: (u) => `Hello, ${u.name}! You are ${u.age} years old.`,
  None: () => "Hello, guest!",
});
console.log(greeting); // "Hello, Alice! You are 30 years old."
```

### Result

The `Result` type represents either success (`Ok`) or failure (`Err`). It's useful for functions that can fail.

```typescript
import { Result, Ok, Err } from "@kolharsam/option-ts";

const okResult: Result<number, string> = Ok(5);
const errResult: Result<number, string> = Err("An error occurred");

console.log(okResult.isOk()); // true
console.log(errResult.isErr()); // true

// Transform success values while preserving errors
const doubled = okResult.map((x) => x * 2);
console.log(doubled.toOk().get()); // 10

// Safe division with detailed error handling
const safeDiv = (a: number, b: number): Result<number, string> => {
  if (b === 0) return Err("Division by zero");
  return Ok(a / b);
};

console.log(safeDiv(10, 2).unwrapOr(0)); // 5
console.log(safeDiv(10, 0).unwrapOr(0)); // 0
```

#### Pattern Matching with `match`

Use `match` for comprehensive error handling:

```typescript
const handleResult = (input: string): string => {
  const parseNumber = (str: string): Result<number, string> => {
    const num = parseInt(str, 10);
    return isNaN(num) ? Err("Not a number") : Ok(num);
  };

  return parseNumber(input).match({
    Ok: (num) => `The number is ${num}, squared: ${num * num}`,
    Err: (error) => `Error: ${error}`,
  });
};

console.log(handleResult("5")); // "The number is 5, squared: 25"
console.log(handleResult("abc")); // "Error: Not a number"

// API response handling
interface ApiResponse {
  data: string[];
  status: number;
}

const processApiResponse = (result: Result<ApiResponse, string>) => {
  return result.match({
    Ok: (response) => response.data.map((item) => item.toUpperCase()),
    Err: (error) => [`Error: ${error}`],
  });
};
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
- `isSomeAnd(fn: (val: T) => boolean): boolean`
- `isNoneOr(fn: (val: T) => boolean): boolean`
- `asSlice(): T[] | []`
- `expect(msg: string): T`
- `unwrap(): T`
- `unwrapOr(def: T): T`
- `unwrapOrElse(fn: () => T): T`
- `mapOr<U>(def: U, fn: (val: T) => U): U`
- `mapOrElse<U>(def: () => U, fn: (val: T) => U): U`
- `okOr<E>(err: E): Result<T, E>`
- `okOrElse<E>(fn: () => E): Result<T, E>`
- `and<U>(optionB: Option<U>): Option<U>`
- `andThen<U>(fn: (val: T) => Option<U>): Option<U>`
- `or(optionB: Option<T>): Option<T>`
- `orElse(optFn: () => Option<T>): Option<T>`
- `xor(optionB: Option<T>): Option<T>`
- `zip<U>(other: Option<U>): Option<[T, U]>`
- `zipWith<U, V>(other: Option<U>, fn: (current: T, other: U) => V): Option<V>`
- `match<U>(patterns: { Some: (value: T) => U; None: () => U }): U`

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
- `map<V>(f: (val: T) => V): Result<V, E>`
- `mapOr<V>(def: V, f: (val: T) => V): V`
- `mapErr<F>(fn: (err: E) => F): Result<T, F>`
- `expect(msg: string): T`
- `unwrap(): T`
- `unwrapOrDefault(def: T): T`
- `expectErr(msg: string): E`
- `unwrapErr(): E`
- `and<V>(res: Result<V, E>): Result<V, E>`
- `andThen<V>(op: (val: T) => Result<V, E>): Result<V, E>`
- `or<F>(res: Result<T, F>): Result<T, F>`
- `orElse<F>(op: (err: E) => Result<T, F>): Result<T, F>`
- `unwrapOr(def: T): T`
- `unwrapOrElse(op: (err: E) => T): T`
- `match<V>(patterns: { Ok: (value: T) => V; Err: (error: E) => V }): V`

### Utility Functions

- `unzip<T, U>(option: Option<[T, U]>): [Option<T>, Option<U>]`
- `transpose<T, E>(option: Option<Result<T, E>>): Result<Option<T>, E>`
- `flatten<T>(option: Option<Option<T>>): Option<T>`
- `transposeResult<T, E>(res: Result<Option<T>, E>): Option<Result<T, E>>`
- `flattenResult<T, E>(res: Result<Result<T, E>, E>): Result<T, E>`

## Advanced Usage

### Chaining Operations

Both `Option` and `Result` support method chaining for elegant composition:

```typescript
// Option chaining
const user = Some({ name: "Alice", scores: [85, 92, 78] });
const result = user
  .map((u) => u.scores)
  .map((scores) => scores.reduce((a, b) => a + b, 0) / scores.length)
  .map((avg) => Math.round(avg))
  .match({
    Some: (avg) => `Average score: ${avg}`,
    None: () => "No scores available",
  });

// Result chaining with error handling
const processUserData = (input: string) =>
  parseJson(input)
    .andThen(validateUser)
    .andThen(calculateMetrics)
    .match({
      Ok: (metrics) => `Success: ${JSON.stringify(metrics)}`,
      Err: (error) => `Failed: ${error}`,
    });
```

### Working with Collections

Transform arrays safely using Option and Result:

```typescript
// Find first even number
const numbers = [1, 3, 5, 8, 9];
const firstEven = numbers.find((n) => n % 2 === 0)
  ? Some(numbers.find((n) => n % 2 === 0)!)
  : None<number>();

firstEven.match({
  Some: (num) => console.log(`First even: ${num}`),
  None: () => console.log("No even numbers found"),
});

// Process array with potential failures
const safeParseNumbers = (strings: string[]): Result<number[], string> => {
  const results = strings.map((s) => {
    const num = parseInt(s, 10);
    return isNaN(num) ? Err(`Invalid: ${s}`) : Ok(num);
  });

  const failures = results.filter((r) => r.isErr());
  if (failures.length > 0) {
    return Err(
      `Parse errors: ${failures.map((f) => f.unwrapErr()).join(", ")}`
    );
  }

  return Ok(results.map((r) => r.unwrap()));
};
```

### Integration with Async/Await

Combine with promises for robust async error handling:

```typescript
async function fetchUser(id: string): Promise<Result<User, string>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      return Err(`HTTP ${response.status}: ${response.statusText}`);
    }
    const user = await response.json();
    return Ok(user);
  } catch (error) {
    return Err(`Network error: ${error.message}`);
  }
}

// Usage
const result = await fetchUser("123");
const message = result.match({
  Ok: (user) => `Welcome, ${user.name}!`,
  Err: (error) => `Login failed: ${error}`,
});
```

## Best Practices

1. **Prefer `match` for complex logic**: Use `match` when you need to handle both cases with different logic.

2. **Use specific error types**: Instead of generic strings, consider using custom error types for better type safety.

3. **Chain operations**: Take advantage of method chaining for readable data transformations.

4. **Avoid unwrap() in production**: Use `unwrapOr()`, `unwrapOrElse()`, or `match` for safer error handling.

5. **Combine with TypeScript**: Leverage TypeScript's type system for even better safety:

```typescript
type ApiError = "NetworkError" | "AuthError" | "ValidationError";

function apiCall(): Result<Data, ApiError> {
  // Implementation
}

// TypeScript will ensure all error cases are handled
apiCall().match({
  Ok: (data) => processData(data),
  Err: (error) => {
    switch (error) {
      case "NetworkError":
        return retryRequest();
      case "AuthError":
        return redirectToLogin();
      case "ValidationError":
        return showValidationErrors();
    }
  },
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
