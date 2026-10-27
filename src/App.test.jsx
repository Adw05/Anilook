import "@testing-library/jest-dom";
import { act, render, waitFor } from "@testing-library/react";
import App from "./App";

const createJsonResponse = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
});

describe("App fetching behavior", () => {
  let observerCallback;

  beforeEach(() => {
    observerCallback = null;
    global.IntersectionObserver = class {
      constructor(callback) {
        observerCallback = callback;
      }

      observe() {}

      disconnect() {}

      unobserve() {}
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("does not issue concurrent duplicate upcoming requests", async () => {
    let resolveUpcomingFirstPage;
    const pendingUpcomingResponse = new Promise((resolve) => {
      resolveUpcomingFirstPage = () =>
        resolve(
          createJsonResponse({
            data: [{ mal_id: 1, title: "Upcoming 1", images: { jpg: { image_url: "img-1" } }, score: 8 }],
            pagination: { has_next_page: true },
          })
        );
    });

    global.fetch = jest.fn((url) => {
      if (url.includes("/top/anime")) {
        return Promise.resolve(
          createJsonResponse({
            data: [{ mal_id: 100, title: "Top 1", images: { jpg: { image_url: "top-1" } }, score: 9 }],
          })
        );
      }

      if (url.includes("seasons/now?page=1")) {
        return pendingUpcomingResponse;
      }

      if (url.includes("seasons/now?page=2")) {
        return Promise.resolve(
          createJsonResponse({
            data: [{ mal_id: 2, title: "Upcoming 2", images: { jpg: { image_url: "img-2" } }, score: 8 }],
            pagination: { has_next_page: false },
          })
        );
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    render(<App />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("seasons/now?page=1&limit=20"));
    });

    act(() => {
      observerCallback?.([{ isIntersecting: true }]);
      observerCallback?.([{ isIntersecting: true }]);
    });

    const upcomingPageOneCalls = global.fetch.mock.calls.filter(([url]) =>
      url.includes("seasons/now?page=1&limit=20")
    );
    expect(upcomingPageOneCalls).toHaveLength(1);

    await act(async () => {
      resolveUpcomingFirstPage();
      await pendingUpcomingResponse;
    });

    await act(async () => {
      observerCallback?.([{ isIntersecting: true }]);
      await Promise.resolve();
    });

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("seasons/now?page=2&limit=20"));
  });

  test("shows upcoming error for malformed payloads", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/top/anime")) {
        return Promise.resolve(createJsonResponse({ data: [] }));
      }

      if (url.includes("seasons/now")) {
        return Promise.resolve(createJsonResponse({ not_data: [] }));
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const { findByText } = render(<App />);

    expect(
      await findByText("Error fetching upcoming anime: Invalid data format received from API")
    ).toBeInTheDocument();
  });
});
