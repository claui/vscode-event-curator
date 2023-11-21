import { EventCurator } from "vscode-event-curator";

describe("EventCurator", () => {
  test("constructor", () => {
    expect(() => new EventCurator({
      language: "ifm",
      changeEventThrottleMillis: 1000,
    })).not.toThrow();
  });
});
