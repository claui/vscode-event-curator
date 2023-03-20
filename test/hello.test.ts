import { hello } from "../src/index";

test("prints Hello, world!", () => {
  expect(hello()).toEqual("Hello, world!");
});
