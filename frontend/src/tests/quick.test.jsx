import { describe, expect,it } from "vitest";

// Very small smoke test that doesn't import the app or any heavy deps.
// This ensures the test runner / environment is OK without touching App/Home.
describe("Quick env check", () => {
  it("vitest runs and the DOM is available", () => {
    // simple DOM sanity check
    const root = document.createElement("div");
    root.id = "root-test";
    document.body.appendChild(root);
    const found = document.getElementById("root-test");
    expect(found).toBeTruthy();
  });
});
