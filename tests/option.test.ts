import {
  Some,
  None,
  unzip,
  flatten,
  transpose,
  Ok,
  Err,
  Result,
  Option,
} from "../src";

describe("Option", () => {
  test("Some", () => {
    const some = Some(5);
    expect(some.isSome()).toBe(true);
    expect(some.isNone()).toBe(false);
    expect(some.get()).toBe(5);
    expect(some.getOrElse(10)).toBe(5);
  });

  test("None", () => {
    const none = None<number>();
    expect(none.isSome()).toBe(false);
    expect(none.isNone()).toBe(true);
    expect(() => none.get()).toThrow("value not found");
    expect(none.getOrElse(10)).toBe(10);
  });

  test("map", () => {
    const some = Some(5);
    const mapped = some.map((x) => x * 2);
    expect(mapped.get()).toBe(10);

    const none = None<number>();
    const mappedNone = none.map((x) => x * 2);
    expect(mappedNone.isNone()).toBe(true);
  });

  test("inspect", () => {
    let inspected = 0;
    const some = Some(5);
    some.inspect((x) => {
      inspected = x;
    });
    expect(inspected).toBe(5);

    const none = None<number>();
    none.inspect((x) => {
      inspected = x;
    });
    expect(inspected).toBe(5); // Unchanged
  });

  test("getOrElse", () => {
    expect(Some(5).getOrElse(10)).toBe(5);
    expect(None<number>().getOrElse(10)).toBe(10);
  });

  test("map with None", () => {
    const none = None<number>();
    const mapped = none.map((x) => x * 2);
    expect(mapped.isNone()).toBe(true);
  });

  test("inspect with None", () => {
    let inspected = false;
    None<number>().inspect(() => {
      inspected = true;
    });
    expect(inspected).toBe(false);
  });

  test("isSomeAnd", () => {
    expect(Some(5).isSomeAnd((x) => x > 0)).toBe(true);
    expect(Some(5).isSomeAnd((x) => x < 0)).toBe(false);
    expect(None<number>().isSomeAnd((x) => x > 0)).toBe(false);
  });

  test("isNoneOr", () => {
    expect(None<number>().isNoneOr((x) => x > 0)).toBe(true);
    expect(Some(5).isNoneOr((x) => x < 0)).toBe(false);
  });

  test("asSlice", () => {
    expect(Some(5).asSlice()).toEqual([5]);
    expect(None<number>().asSlice()).toEqual([]);
  });

  test("expect", () => {
    expect(Some(5).expect("Error")).toBe(5);
    expect(() => None<number>().expect("Error")).toThrow("Error");
  });

  test("unwrap", () => {
    expect(Some(5).unwrap()).toBe(5);
    expect(() => None<number>().unwrap()).toThrow();
  });

  test("unwrapOr", () => {
    expect(Some(5).unwrapOr(10)).toBe(5);
    expect(None<number>().unwrapOr(10)).toBe(10);
  });

  test("unwrapOrElse", () => {
    expect(Some(5).unwrapOrElse(() => 10)).toBe(5);
    expect(None<number>().unwrapOrElse(() => 10)).toBe(10);
  });

  test("mapOr", () => {
    expect(Some(5).mapOr(10, (x) => x * 2)).toBe(10);
    expect(None<number>().mapOr(10, (x) => x * 2)).toBe(10);
  });

  test("mapOrElse", () => {
    expect(
      Some(5).mapOrElse(
        () => 10,
        (x) => x * 2
      )
    ).toBe(10);
    expect(
      None<number>().mapOrElse(
        () => 10,
        (x) => x * 2
      )
    ).toBe(10);
  });

  test("okOr", () => {
    expect(Some(5).okOr("error").isOk()).toBe(true);
    expect(None<number>().okOr("error").isErr()).toBe(true);
  });

  test("okOrElse", () => {
    expect(
      Some(5)
        .okOrElse(() => "error")
        .isOk()
    ).toBe(true);
    expect(
      None<number>()
        .okOrElse(() => "error")
        .isErr()
    ).toBe(true);
  });

  test("and", () => {
    expect(Some(5).and(Some(10)).unwrap()).toBe(10);
    expect(Some(5).and(None<number>()).isNone()).toBe(true);
    expect(None<number>().and(Some(10)).isNone()).toBe(true);
  });

  test("andThen", () => {
    expect(
      Some(5)
        .andThen((x) => Some(x * 2))
        .unwrap()
    ).toBe(10);
    expect(
      Some(5)
        .andThen(() => None<number>())
        .isNone()
    ).toBe(true);
    expect(
      None<number>()
        .andThen((x) => Some(x * 2))
        .isNone()
    ).toBe(true);
  });

  test("or", () => {
    expect(Some(5).or(Some(10)).unwrap()).toBe(5);
    expect(None<number>().or(Some(10)).unwrap()).toBe(10);
  });

  test("orElse", () => {
    expect(
      Some(5)
        .orElse(() => Some(10))
        .unwrap()
    ).toBe(5);
    expect(
      None<number>()
        .orElse(() => Some(10))
        .unwrap()
    ).toBe(10);
  });

  test("xor", () => {
    expect(Some(5).xor(None<number>()).unwrap()).toBe(5);
    expect(None<number>().xor(Some(10)).unwrap()).toBe(10);
    expect(Some(5).xor(Some(10)).isNone()).toBe(true);
    expect(None<number>().xor(None<number>()).isNone()).toBe(true);
  });

  test("zip", () => {
    expect(Some(5).zip(Some("a")).unwrap()).toEqual([5, "a"]);
    expect(Some(5).zip(None<string>()).isNone()).toBe(true);
    expect(None<number>().zip(Some("a")).isNone()).toBe(true);
  });

  test("zipWith", () => {
    expect(
      Some(5)
        .zipWith(Some(10), (a, b) => a + b)
        .unwrap()
    ).toBe(15);
    expect(
      Some(5)
        .zipWith(None<number>(), (a, b) => a + b)
        .isNone()
    ).toBe(true);
    expect(
      None<number>()
        .zipWith(Some(10), (a, b) => a + b)
        .isNone()
    ).toBe(true);
  });

  test("unzip", () => {
    const [a, b] = unzip(Some([5, "a"]));
    expect(a.unwrap()).toBe(5);
    expect(b.unwrap()).toBe("a");

    const [c, d] = unzip(None<[number, string]>());
    expect(c.isNone()).toBe(true);
    expect(d.isNone()).toBe(true);
  });

  test("transpose", () => {
    expect(
      transpose(Some(Ok(5)))
        .unwrap()
        .unwrap()
    ).toBe(5);
    expect(transpose(Some(Err("error"))).isErr()).toBe(true);
    expect(transpose(None<Result<number, string>>()).unwrap().isNone()).toBe(
      true
    );

    const transposedOk = transpose(Some(Ok(5)));
    expect(transposedOk.isOk()).toBe(true);
    expect(transposedOk.toOk().get().get()).toBe(5);

    const transposedErr = transpose(Some(Err("error")));
    expect(transposedErr.isErr()).toBe(true);

    const transposedNone = transpose(None<Result<number, string>>());
    expect(transposedNone.isOk()).toBe(true);
    expect(transposedNone.toOk().get().isNone()).toBe(true);
  });

  test("flatten", () => {
    expect(flatten(Some(Some(5))).unwrap()).toBe(5);
    expect(flatten(Some(None<number>())).isNone()).toBe(true);
    expect(flatten(None<Option<number>>()).isNone()).toBe(true);
  });

  test("match - Some", () => {
    const some = Some(42);
    const result = some.match({
      Some: (value) => `Value is ${value}`,
      None: () => "No value",
    });
    expect(result).toBe("Value is 42");
  });

  test("match - None", () => {
    const none = None<number>();
    const result = none.match({
      Some: (value) => `Value is ${value}`,
      None: () => "No value",
    });
    expect(result).toBe("No value");
  });

  test("match - different return types", () => {
    const some = Some("hello");
    const numberResult = some.match({
      Some: (value) => value.length,
      None: () => 0,
    });
    expect(numberResult).toBe(5);

    const none = None<string>();
    const noneNumberResult = none.match({
      Some: (value) => value.length,
      None: () => 0,
    });
    expect(noneNumberResult).toBe(0);
  });

  test("match - complex objects", () => {
    interface User {
      name: string;
      age: number;
    }

    const userOption = Some<User>({ name: "Alice", age: 30 });
    const greeting = userOption.match({
      Some: (user) => `Hello, ${user.name}! You are ${user.age} years old.`,
      None: () => "Hello, guest!",
    });
    expect(greeting).toBe("Hello, Alice! You are 30 years old.");

    const noUserOption = None<User>();
    const noUserGreeting = noUserOption.match({
      Some: (user) => `Hello, ${user.name}! You are ${user.age} years old.`,
      None: () => "Hello, guest!",
    });
    expect(noUserGreeting).toBe("Hello, guest!");
  });

  describe("async integration", () => {
    test("async function returning Option", async () => {
      const asyncFetchUser = async (
        id: string
      ): Promise<Option<{ name: string; age: number }>> => {
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 10));

        if (id === "123") {
          return Some({ name: "Alice", age: 30 });
        }
        return None();
      };

      const validUser = await asyncFetchUser("123");
      expect(validUser.isSome()).toBe(true);
      expect(validUser.unwrap().name).toBe("Alice");

      const invalidUser = await asyncFetchUser("999");
      expect(invalidUser.isNone()).toBe(true);
    });

    test("async match patterns", async () => {
      const asyncProcessUser = async (userId: string): Promise<string> => {
        const fetchUser = async (
          id: string
        ): Promise<Option<{ name: string; role: string }>> => {
          await new Promise((resolve) => setTimeout(resolve, 5));

          const users = new Map([
            ["1", { name: "Alice", role: "admin" }],
            ["2", { name: "Bob", role: "user" }],
          ]);

          const user = users.get(id);
          return user ? Some(user) : None();
        };

        const userOption = await fetchUser(userId);
        return userOption.match({
          Some: (user) => `${user.name} (${user.role})`,
          None: () => "User not found",
        });
      };

      expect(await asyncProcessUser("1")).toBe("Alice (admin)");
      expect(await asyncProcessUser("2")).toBe("Bob (user)");
      expect(await asyncProcessUser("999")).toBe("User not found");
    });

    test("chaining async operations with Option", async () => {
      interface DatabaseRecord {
        id: string;
        data: string;
      }

      const mockDatabase = new Map([
        ["key1", { id: "key1", data: "value1" }],
        ["key2", { id: "key2", data: "value2" }],
      ]);

      const asyncGet = async (key: string): Promise<Option<DatabaseRecord>> => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        const record = mockDatabase.get(key);
        return record ? Some(record) : None();
      };

      const processRecord = async (key: string): Promise<string> => {
        const record = await asyncGet(key);
        return record
          .map((r) => r.data.toUpperCase())
          .map((data) => `Processed: ${data}`)
          .unwrapOr("No data found");
      };

      expect(await processRecord("key1")).toBe("Processed: VALUE1");
      expect(await processRecord("nonexistent")).toBe("No data found");
    });

    test("Promise.all with multiple Options", async () => {
      const asyncGetNumber = async (n: number): Promise<Option<number>> => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));
        return n > 0 ? Some(n * 2) : None();
      };

      const results = await Promise.all([
        asyncGetNumber(5),
        asyncGetNumber(10),
        asyncGetNumber(-1),
        asyncGetNumber(7),
      ]);

      expect(results[0].unwrapOr(0)).toBe(10);
      expect(results[1].unwrapOr(0)).toBe(20);
      expect(results[2].isNone()).toBe(true);
      expect(results[3].unwrapOr(0)).toBe(14);

      // Count successful operations
      const successCount = results.filter((opt) => opt.isSome()).length;
      expect(successCount).toBe(3);
    });

    test("async error handling with Option", async () => {
      const riskyAsyncOperation = async (
        shouldFail: boolean
      ): Promise<Option<string>> => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 5));

          if (shouldFail) {
            throw new Error("Simulated failure");
          }

          return Some("Success!");
        } catch (error) {
          // Convert exception to None
          return None();
        }
      };

      const successResult = await riskyAsyncOperation(false);
      expect(successResult.isSome()).toBe(true);
      expect(successResult.unwrap()).toBe("Success!");

      const failureResult = await riskyAsyncOperation(true);
      expect(failureResult.isNone()).toBe(true);
    });
  });
});
