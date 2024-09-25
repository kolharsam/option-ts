import { Some, None } from "../src";

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
});
