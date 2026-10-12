import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

// Mock Supabase Client
const mockCreateUser = vi.fn();

vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: vi.fn().mockImplementation(() => ({
      auth: {
        admin: {
          createUser: mockCreateUser,
        },
      },
    })),
  };
});

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_key";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:8000";
  });

  it("should reject if validation fails", async () => {
    const request = new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "not-email", // invalid
        password: "123", // too short
        username: "jo", // too short
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("should return 500 if service role key is missing or default", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key-here";
    
    const request = new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it("should create user successfully", async () => {
    mockCreateUser.mockResolvedValueOnce({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const request = new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        username: "testuser",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.userId).toBe("user-123");
    expect(mockCreateUser).toHaveBeenCalledWith(expect.objectContaining({
      email: "test@example.com",
      password: "password123",
      email_confirm: true,
    }));
  });

  it("should handle duplicate email elegantly (409)", async () => {
    mockCreateUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "Email has already been registered" },
    });

    const request = new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "duplicate@example.com",
        password: "password123",
        username: "testuser",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
  });
});
