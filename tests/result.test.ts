import {
  Ok,
  Err,
  transposeResult,
  flattenResult,
  Some,
  None,
  Result,
} from "../src";

describe("Result", () => {
  test("Ok", () => {
    const ok = Ok<number, string>(5);
    expect(ok.isOk()).toBe(true);
    expect(ok.isErr()).toBe(false);
    expect(ok.toOk().get()).toBe(5);
    expect(ok.toErr().isNone()).toBe(true);
  });

  test("Err", () => {
    const err = Err<number, string>("error");
    expect(err.isOk()).toBe(false);
    expect(err.isErr()).toBe(true);
    expect(err.toOk().isNone()).toBe(true);
    expect(err.toErr().get()).toBe("error");
  });

  test("isOkAnd and isErrAnd", () => {
    const ok = Ok<number, string>(5);
    expect(ok.isOkAnd((x) => x > 3)).toBe(true);
    expect(ok.isOkAnd((x) => x > 10)).toBe(false);

    const err = Err<number, string>("error");
    expect(err.isErrAnd((e) => e.length > 3)).toBe(true);
    expect(err.isErrAnd((e) => e.length > 10)).toBe(false);
  });

  test("inspect and inspectErr", () => {
    let inspected = 0;
    const ok = Ok<number, string>(5);
    ok.inspect((x) => {
      inspected = x;
    });
    expect(inspected).toBe(5);

    let inspectedErr = "";
    const err = Err<number, string>("error");
    err.inspectErr((e) => {
      inspectedErr = e;
    });
    expect(inspectedErr).toBe("error");
  });

  test("map", () => {
    const ok = Ok<number, string>(5);
    const mapped = ok.map((x) => x * 2);
    expect(mapped.toOk().get()).toBe(10);

    const err = Err<number, string>("error");
    const mappedErr = err.map((x) => x * 2);
    expect(mappedErr.isErr()).toBe(true);
    expect(mappedErr.toErr().get()).toBe("error");
  });

  test("isOkAnd and isErrAnd with incorrect types", () => {
    const ok = Ok<number, string>(5);
    expect(ok.isErrAnd((e) => e.length > 3)).toBe(false);

    const err = Err<number, string>("error");
    expect(err.isOkAnd((x) => x > 3)).toBe(false);
  });

  test("toOk and toErr", () => {
    const ok = Ok<number, string>(5);
    expect(ok.toOk().isSome()).toBe(true);
    expect(ok.toOk().get()).toBe(5);
    expect(ok.toErr().isNone()).toBe(true);

    const err = Err<number, string>("error");
    expect(err.toOk().isNone()).toBe(true);
    expect(err.toErr().isSome()).toBe(true);
    expect(err.toErr().get()).toBe("error");
  });

  test("inspect and inspectErr with incorrect types", () => {
    let inspected = false;
    Ok<number, string>(5).inspectErr(() => {
      inspected = true;
    });
    expect(inspected).toBe(false);

    inspected = false;
    Err<number, string>("error").inspect(() => {
      inspected = true;
    });
    expect(inspected).toBe(false);
  });

  test("map with Err", () => {
    const err = Err<number, string>("error");
    const mapped = err.map((x) => x * 2);
    expect(mapped.isErr()).toBe(true);
    expect(mapped.toErr().get()).toBe("error");
  });

  test("isOk and isErr", () => {
    expect(Ok(5).isOk()).toBe(true);
    expect(Ok(5).isErr()).toBe(false);
    expect(Err("error").isOk()).toBe(false);
    expect(Err("error").isErr()).toBe(true);
  });

  test("isOkAnd and isErrAnd with different conditions", () => {
    expect(Ok(5).isOkAnd((x) => x % 2 === 0)).toBe(false);
    expect(Ok(6).isOkAnd((x) => x % 2 === 0)).toBe(true);
    expect(Err("error").isErrAnd((e) => e.includes("err"))).toBe(true);
    expect(Err("mistake").isErrAnd((e) => e.includes("err"))).toBe(false);
  });

  test("inspect and inspectErr chaining", () => {
    let value = 0;
    const ok = Ok(5)
      .inspect((x) => {
        value += x;
      })
      .inspect((x) => {
        value += x * 2;
      });
    expect(value).toBe(15);
    expect(ok.isOk()).toBe(true);

    let errorMessage = "";
    const err = Err("error")
      .inspectErr((e) => {
        errorMessage += e;
      })
      .inspectErr((e) => {
        errorMessage += "!";
      });
    expect(errorMessage).toBe("error!");
    expect(err.isErr()).toBe(true);
  });

  test("map chaining", () => {
    const result = Ok(5)
      .map((x) => x * 2)
      .map((x) => x.toString());
    expect(result.isOk()).toBe(true);
    expect(result.toOk().get()).toBe("10");

    const errResult = Err<number, string>("error")
      .map((x) => x * 2)
      .map((x) => x.toString());
    expect(errResult.isErr()).toBe(true);
    expect(errResult.toErr().get()).toBe("error");
  });

  test("mapOr", () => {
    expect(Ok<number, string>(5).mapOr(10, (x) => x * 2)).toBe(10);
    expect(Err<number, string>("error").mapOr(10, (x) => x * 2)).toBe(10);
  });

  test("mapOrElse", () => {
    expect(
      Ok<number, string>(5).mapOrElse(
        () => 10,
        (x) => x * 2
      )
    ).toBe(10);
    expect(
      Err<number, string>("error").mapOrElse(
        () => 10,
        (x) => x * 2
      )
    ).toBe(10);
  });

  test("mapErr", () => {
    expect(
      Ok<number, string>(5)
        .mapErr((e) => e.length)
        .isOk()
    ).toBe(true);
    expect(
      Err<number, string>("error")
        .mapErr((e) => e.length)
        .toErr()
        .get()
    ).toBe(5);
  });

  test("expect", () => {
    expect(Ok(5).expect("Failed")).toBe(5);
    expect(() => Err("error").expect("Failed")).toThrow("Failed");
  });

  test("unwrap", () => {
    expect(Ok(5).unwrap()).toBe(5);
    expect(() => Err("error").unwrap()).toThrow();
  });

  test("unwrapOrDefault", () => {
    expect(Ok(5).unwrapOrDefault(10)).toBe(5);
    expect(Err("error").unwrapOrDefault(10)).toBe(10);
  });

  test("expectErr", () => {
    expect(Err("error").expectErr("Unexpected Ok")).toBe("error");
    expect(() => Ok(5).expectErr("Unexpected Ok")).toThrow("Unexpected Ok");
  });

  test("unwrapErr", () => {
    expect(Err("error").unwrapErr()).toBe("error");
    expect(() => Ok(5).unwrapErr()).toThrow();
  });

  test("and", () => {
    expect(Ok(5).and(Ok(10)).toOk().get()).toBe(10);
    expect(Ok(5).and(Err<any, any>("error")).isErr()).toBe(true);
    expect(Err("error").and(Ok(10)).isErr()).toBe(true);
  });

  test("andThen", () => {
    expect(
      Ok(5)
        .andThen((x) => Ok(x * 2))
        .toOk()
        .get()
    ).toBe(10);
    expect(
      Ok(5)
        .andThen(() => Err<any, any>("error"))
        .isErr()
    ).toBe(true);
    expect(
      Err("error")
        .andThen((x: any) => Ok(x * 2))
        .isErr()
    ).toBe(true);
  });

  test("or", () => {
    expect(Ok(5).or(Ok(10)).toOk().get()).toBe(5);
    expect(
      Err("error")
        .or(Ok(10) as any)
        .toOk()
        .get()
    ).toBe(10);
  });

  test("orElse", () => {
    expect(
      Ok(5)
        .orElse(() => Ok(10))
        .toOk()
        .get()
    ).toBe(5);
    expect(
      Err("error")
        .orElse(() => Ok(10) as any)
        .toOk()
        .get()
    ).toBe(10);
  });

  test("unwrapOr", () => {
    expect(Ok(5).unwrapOr(10)).toBe(5);
    expect(Err("error").unwrapOr(10)).toBe(10);
  });

  test("unwrapOrElse", () => {
    expect(Ok(5).unwrapOrElse(() => 10)).toBe(5);
    expect(Err("error").unwrapOrElse(() => 10)).toBe(10);
  });

  test("transposeResult", () => {
    expect(
      transposeResult(Ok(Some(5)))
        .get()
        .toOk()
        .get()
    ).toBe(5);
    expect(transposeResult(Ok(None())).isNone()).toBe(true);
    expect(
      transposeResult(Err("error") as any)
        .get()
        .isErr()
    ).toBe(true);
  });

  test("flattenResult", () => {
    expect(
      flattenResult(Ok(Ok(5)))
        .toOk()
        .get()
    ).toBe(5);
    expect(
      flattenResult(Ok(Err("inner error")) as any)
        .toErr()
        .get()
    ).toBe("inner error");
    expect(
      flattenResult(Err("outer error") as any)
        .toErr()
        .get()
    ).toBe("outer error");
  });

  test("match - Ok", () => {
    const ok = Ok<number, string>(42);
    const result = ok.match({
      Ok: (value) => `Success: ${value}`,
      Err: (error) => `Error: ${error}`,
    });
    expect(result).toBe("Success: 42");
  });

  test("match - Err", () => {
    const err = Err<number, string>("Something went wrong");
    const result = err.match({
      Ok: (value) => `Success: ${value}`,
      Err: (error) => `Error: ${error}`,
    });
    expect(result).toBe("Error: Something went wrong");
  });

  test("match - different return types", () => {
    const ok = Ok<string, number>("hello");
    const lengthResult = ok.match({
      Ok: (value) => value.length,
      Err: (error) => error,
    });
    expect(lengthResult).toBe(5);

    const err = Err<string, number>(404);
    const errorResult = err.match({
      Ok: (value) => value.length,
      Err: (error) => error,
    });
    expect(errorResult).toBe(404);
  });

  test("match - complex computation", () => {
    interface ApiResponse {
      data: string[];
      status: number;
    }

    const successResult = Ok<ApiResponse, string>({
      data: ["item1", "item2", "item3"],
      status: 200,
    });

    const processedData = successResult.match({
      Ok: (response) => response.data.map((item) => item.toUpperCase()),
      Err: (error) => [`Error: ${error}`],
    });

    expect(processedData).toEqual(["ITEM1", "ITEM2", "ITEM3"]);

    const errorResult = Err<ApiResponse, string>("Network timeout");
    const processedError = errorResult.match({
      Ok: (response) => response.data.map((item) => item.toUpperCase()),
      Err: (error) => [`Error: ${error}`],
    });

    expect(processedError).toEqual(["Error: Network timeout"]);
  });

  test("match - functional composition", () => {
    const parseNumber = (str: string): Result<number, string> => {
      const num = parseInt(str, 10);
      return isNaN(num) ? Err("Not a number") : Ok(num);
    };

    const processUserInput = (input: string): string => {
      return parseNumber(input).match({
        Ok: (num: number) =>
          `The number is ${num}, and its square is ${num * num}`,
        Err: (error: string) => `Invalid input: ${error}`,
      });
    };

    expect(processUserInput("5")).toBe("The number is 5, and its square is 25");
    expect(processUserInput("abc")).toBe("Invalid input: Not a number");
  });

  describe("async integration", () => {
    test("async function returning Result", async () => {
      interface User {
        id: string;
        name: string;
        email: string;
      }

      const asyncFetchUser = async (
        id: string
      ): Promise<Result<User, string>> => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 10));

        if (id === "123") {
          return Ok({ id: "123", name: "Alice", email: "alice@example.com" });
        }
        if (id === "404") {
          return Err("User not found");
        }
        if (id === "500") {
          return Err("Server error");
        }
        return Err("Invalid user ID");
      };

      const validUser = await asyncFetchUser("123");
      expect(validUser.isOk()).toBe(true);
      expect(validUser.unwrap().name).toBe("Alice");

      const notFoundUser = await asyncFetchUser("404");
      expect(notFoundUser.isErr()).toBe(true);
      expect(notFoundUser.unwrapErr()).toBe("User not found");

      const serverErrorUser = await asyncFetchUser("500");
      expect(serverErrorUser.isErr()).toBe(true);
      expect(serverErrorUser.unwrapErr()).toBe("Server error");
    });

    test("async Result with match patterns", async () => {
      type ApiError =
        | "NetworkError"
        | "AuthError"
        | "NotFound"
        | "ValidationError";

      const asyncApiCall = async (
        endpoint: string
      ): Promise<Result<{ data: string }, ApiError>> => {
        await new Promise((resolve) => setTimeout(resolve, 5));

        switch (endpoint) {
          case "/success":
            return Ok({ data: "Success response" });
          case "/network-fail":
            return Err("NetworkError" as ApiError);
          case "/auth-fail":
            return Err("AuthError" as ApiError);
          case "/not-found":
            return Err("NotFound" as ApiError);
          default:
            return Err("ValidationError" as ApiError);
        }
      };

      const handleApiResponse = async (endpoint: string): Promise<string> => {
        const result = await asyncApiCall(endpoint);
        return result.match({
          Ok: (response) => `Success: ${response.data}`,
          Err: (error) => {
            switch (error) {
              case "NetworkError":
                return "Network connection failed";
              case "AuthError":
                return "Authentication required";
              case "NotFound":
                return "Resource not found";
              case "ValidationError":
                return "Invalid request";
            }
          },
        });
      };

      expect(await handleApiResponse("/success")).toBe(
        "Success: Success response"
      );
      expect(await handleApiResponse("/network-fail")).toBe(
        "Network connection failed"
      );
      expect(await handleApiResponse("/auth-fail")).toBe(
        "Authentication required"
      );
      expect(await handleApiResponse("/not-found")).toBe("Resource not found");
      expect(await handleApiResponse("/invalid")).toBe("Invalid request");
    });

    test("chaining async operations with Result", async () => {
      interface UserProfile {
        userId: string;
        preferences: { theme: string; language: string };
      }

      interface UserPermissions {
        canRead: boolean;
        canWrite: boolean;
        canDelete: boolean;
      }

      const asyncGetUser = async (
        id: string
      ): Promise<Result<{ name: string }, string>> => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return id === "valid" ? Ok({ name: "Alice" }) : Err("User not found");
      };

      const asyncGetProfile = async (user: {
        name: string;
      }): Promise<Result<UserProfile, string>> => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        if (user.name === "Alice") {
          return Ok({
            userId: "123",
            preferences: { theme: "dark", language: "en" },
          });
        }
        return Err("Profile not found");
      };

      const asyncGetPermissions = async (
        profile: UserProfile
      ): Promise<Result<UserPermissions, string>> => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return Ok({
          canRead: true,
          canWrite: profile.userId === "123",
          canDelete: false,
        } as UserPermissions);
      };

      const processUserData = async (userId: string): Promise<string> => {
        const userResult = await asyncGetUser(userId);

        if (userResult.isErr()) {
          return `Error: ${userResult.unwrapErr()}`;
        }

        const profileResult = await asyncGetProfile(userResult.unwrap());
        if (profileResult.isErr()) {
          return `Error: ${profileResult.unwrapErr()}`;
        }

        const permissionsResult = await asyncGetPermissions(
          profileResult.unwrap()
        );
        return permissionsResult.match({
          Ok: (perms) =>
            `Permissions: read=${perms.canRead}, write=${perms.canWrite}, delete=${perms.canDelete}`,
          Err: (error) => `Error: ${error}`,
        });
      };

      expect(await processUserData("valid")).toBe(
        "Permissions: read=true, write=true, delete=false"
      );
      expect(await processUserData("invalid")).toBe("Error: User not found");
    });

    test("Promise.all with multiple Results", async () => {
      const asyncValidateField = async (
        field: string,
        value: string
      ): Promise<Result<string, string>> => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));

        switch (field) {
          case "email":
            return value.includes("@")
              ? Ok(value)
              : Err("Invalid email format");
          case "age":
            const age = parseInt(value, 10);
            return !isNaN(age) && age >= 0 && age <= 120
              ? Ok(value)
              : Err("Invalid age");
          case "name":
            return value.length >= 2 ? Ok(value) : Err("Name too short");
          default:
            return Err("Unknown field");
        }
      };

      const validateForm = async (
        data: Record<string, string>
      ): Promise<Result<Record<string, string>, string[]>> => {
        const validations = await Promise.all([
          asyncValidateField("email", data.email),
          asyncValidateField("age", data.age),
          asyncValidateField("name", data.name),
        ]);

        const errors = validations
          .filter((result) => result.isErr())
          .map((result) => result.unwrapErr());

        if (errors.length > 0) {
          return Err(errors);
        }

        return Ok(data);
      };

      const validData = { email: "test@example.com", age: "25", name: "Alice" };
      const validResult = await validateForm(validData);
      expect(validResult.isOk()).toBe(true);

      const invalidData = { email: "invalid", age: "200", name: "A" };
      const invalidResult = await validateForm(invalidData);
      expect(invalidResult.isErr()).toBe(true);
      expect(invalidResult.unwrapErr()).toEqual([
        "Invalid email format",
        "Invalid age",
        "Name too short",
      ]);
    });

    test("async error recovery with Result", async () => {
      interface CacheItem {
        value: string;
        expiry: number;
      }

      const mockCache = new Map<string, CacheItem>();
      const mockDatabase = new Map([
        ["user1", "Alice"],
        ["user2", "Bob"],
      ]);

      const asyncGetFromCache = async (
        key: string
      ): Promise<Result<string, string>> => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        const item = mockCache.get(key);

        if (!item) {
          return Err("Cache miss");
        }

        if (Date.now() > item.expiry) {
          mockCache.delete(key);
          return Err("Cache expired");
        }

        return Ok(item.value);
      };

      const asyncGetFromDatabase = async (
        key: string
      ): Promise<Result<string, string>> => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        const value = mockDatabase.get(key);
        return value ? Ok(value) : Err("Not found in database");
      };

      const asyncGetWithFallback = async (
        key: string
      ): Promise<Result<string, string>> => {
        const cacheResult = await asyncGetFromCache(key);

        if (cacheResult.isOk()) {
          return cacheResult;
        }

        // Fallback to database
        const dbResult = await asyncGetFromDatabase(key);

        if (dbResult.isOk()) {
          // Cache the result for future requests
          mockCache.set(key, {
            value: dbResult.unwrap(),
            expiry: Date.now() + 60000, // 1 minute
          });
        }

        return dbResult;
      };

      // Test cache miss -> database hit
      const result1 = await asyncGetWithFallback("user1");
      expect(result1.isOk()).toBe(true);
      expect(result1.unwrap()).toBe("Alice");

      // Test cache hit (should be faster)
      const result2 = await asyncGetWithFallback("user1");
      expect(result2.isOk()).toBe(true);
      expect(result2.unwrap()).toBe("Alice");

      // Test not found anywhere
      const result3 = await asyncGetWithFallback("user999");
      expect(result3.isErr()).toBe(true);
      expect(result3.unwrapErr()).toBe("Not found in database");
    });

    test("async Result with complex error types", async () => {
      interface ValidationError {
        field: string;
        message: string;
      }

      interface NetworkError {
        code: number;
        message: string;
      }

      type ApiError = ValidationError | NetworkError;

      const asyncValidateAndSubmit = async (data: {
        email: string;
      }): Promise<Result<{ id: string }, ApiError>> => {
        await new Promise((resolve) => setTimeout(resolve, 5));

        // Validation phase
        if (!data.email.includes("@")) {
          return Err({
            field: "email",
            message: "Invalid email format",
          } as ApiError);
        }

        // Network simulation
        if (data.email === "timeout@example.com") {
          return Err({
            code: 408,
            message: "Request timeout",
          } as ApiError);
        }

        if (data.email === "server@example.com") {
          return Err({
            code: 500,
            message: "Internal server error",
          } as ApiError);
        }

        return Ok({ id: "12345" });
      };

      const handleSubmission = async (email: string): Promise<string> => {
        const result = await asyncValidateAndSubmit({ email });

        return result.match({
          Ok: (response) => `Successfully created with ID: ${response.id}`,
          Err: (error) => {
            if ("field" in error) {
              return `Validation error in ${error.field}: ${error.message}`;
            } else {
              return `Network error ${error.code}: ${error.message}`;
            }
          },
        });
      };

      expect(await handleSubmission("valid@example.com")).toBe(
        "Successfully created with ID: 12345"
      );
      expect(await handleSubmission("invalid")).toBe(
        "Validation error in email: Invalid email format"
      );
      expect(await handleSubmission("timeout@example.com")).toBe(
        "Network error 408: Request timeout"
      );
      expect(await handleSubmission("server@example.com")).toBe(
        "Network error 500: Internal server error"
      );
    });
  });
});
