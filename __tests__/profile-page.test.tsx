import { render, screen } from "@testing-library/react";
import ProfilePage from "@/app/profile/page";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { getProfileByClerkId } from "@/app/services/profileService";
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

// Mock profile service
vi.mock("@/app/services/profileService", () => ({
  getProfileByClerkId: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("ProfilePage", () => {
  const mockUser = {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    imageUrl: "https://example.com/avatar.jpg",
    role: "USER",
    planType: "FREE",
    credits: 100,
    creditCap: 1000,
    bio: "Test bio",
    jobTitle: "Software Engineer",
    location: "San Francisco",
    company: "Test Company",
    website: "https://example.com",
    twitter: "@johndoe",
    linkedin: "https://linkedin.com/in/johndoe",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to sign-in if user is not authenticated", async () => {
    const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
    const mockCurrentUser = currentUser as unknown as ReturnType<typeof vi.fn>;
    
    mockAuth.mockResolvedValueOnce({ userId: null });
    mockCurrentUser.mockResolvedValueOnce(null);

    await ProfilePage();
    expect(require("next/navigation").redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("redirects to sign-in if user is not found in database", async () => {
    const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
    const mockCurrentUser = currentUser as unknown as ReturnType<typeof vi.fn>;
    
    mockAuth.mockResolvedValueOnce({ userId: "user-123" });
    mockCurrentUser.mockResolvedValueOnce({ id: "user-123" });
    (getProfileByClerkId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await ProfilePage();
    expect(require("next/navigation").redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("renders profile page with user data", async () => {
    const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
    const mockCurrentUser = currentUser as unknown as ReturnType<typeof vi.fn>;
    
    mockAuth.mockResolvedValueOnce({ userId: "user-123" });
    mockCurrentUser.mockResolvedValueOnce({ 
      id: "user-123",
      imageUrl: "https://example.com/avatar.jpg",
    });
    (getProfileByClerkId as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockUser);

    const { container } = render(await ProfilePage());

    // Check if profile form is rendered
    expect(screen.getByText(/personal information/i)).toBeInTheDocument();
    expect(screen.getByText(/professional information/i)).toBeInTheDocument();
    expect(screen.getByText(/social links/i)).toBeInTheDocument();

    // Check if user data is displayed
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.bio!)).toBeInTheDocument();
    expect(screen.getByText(mockUser.jobTitle!)).toBeInTheDocument();
    expect(screen.getByText(mockUser.company!)).toBeInTheDocument();
    expect(screen.getByText(mockUser.location!)).toBeInTheDocument();
    expect(screen.getByText(mockUser.website!)).toBeInTheDocument();
    expect(screen.getByText(mockUser.twitter!)).toBeInTheDocument();
    expect(screen.getByText(mockUser.linkedin!)).toBeInTheDocument();
  });
}); 