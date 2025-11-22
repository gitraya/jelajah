import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import App from "@/App";

describe("App (smoke)", () => {
  it("renders root app without crashing", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const root = document.getElementById("root");
    expect(root).toBeTruthy();
  });
});
