import { afterEach, describe, expect, it, vi } from "vitest";

const verifyIdTokenMock = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({
    verifyIdToken: verifyIdTokenMock,
  }),
}));

afterEach(() => {
  verifyIdTokenMock.mockReset();
});

describe("verifyIdToken", () => {
  it("throws when the Authorization header is missing", async () => {
    const { verifyIdToken } = await import("./middleware");
    const request = new Request("https://example.com");

    await expect(verifyIdToken(request)).rejects.toThrow("Unauthorized");
    expect(verifyIdTokenMock).not.toHaveBeenCalled();
  });

  it("throws when the Authorization header is not a bearer token", async () => {
    const { verifyIdToken } = await import("./middleware");
    const request = new Request("https://example.com", {
      headers: {
        Authorization: "Basic abc123",
      },
    });

    await expect(verifyIdToken(request)).rejects.toThrow("Unauthorized");
    expect(verifyIdTokenMock).not.toHaveBeenCalled();
  });

  it("returns the uid from the decoded bearer token", async () => {
    const { verifyIdToken } = await import("./middleware");
    verifyIdTokenMock.mockResolvedValue({ uid: "user-123" });
    const request = new Request("https://example.com", {
      headers: {
        Authorization: "Bearer token-abc",
      },
    });

    await expect(verifyIdToken(request)).resolves.toBe("user-123");
    expect(verifyIdTokenMock).toHaveBeenCalledWith("token-abc");
  });
});
