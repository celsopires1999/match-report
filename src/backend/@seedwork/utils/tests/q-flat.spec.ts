import { flatten } from "./q-flat";

describe("Q-Flat", () => {
  it("should flatten deep keys", () => {
    const result = flatten({ a: { b: { c: 1 } } });
    expect(result).toEqual({ "a[b][c]": 1 });
  });

  it("should flatten deep keys with arrays", () => {
    const result = flatten({ a: { b: [{ c: 1 }] } });
    expect(result).toEqual({ "a[b][0][c]": 1 });
  });

  it("should return undefined with a non object", () => {
    const result = flatten(1);
    expect(result).toBeUndefined();
  });
});
