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
});
