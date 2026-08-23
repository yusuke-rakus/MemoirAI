import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LegacyLegalRedirect } from "./LegacyLegalRedirect";

const LocationView = () => {
  const location = useLocation();
  return <div>{`${location.pathname}${location.hash}`}</div>;
};

describe("LegacyLegalRedirect", () => {
  it.each([
    ["terms", "/legal#terms"],
    ["privacy", "/legal#privacy"],
    ["ai-data-use", "/legal#ai-data-use"],
  ] as const)("%sを統合ページの対応箇所へ転送する", (documentId, expected) => {
    render(
      <MemoryRouter initialEntries={[`/${documentId}`]}>
        <Routes>
          <Route
            path={`/${documentId}`}
            element={<LegacyLegalRedirect documentId={documentId} />}
          />
          <Route path="/legal" element={<LocationView />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
