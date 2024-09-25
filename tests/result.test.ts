import { Ok, Err } from "../src";

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
});
