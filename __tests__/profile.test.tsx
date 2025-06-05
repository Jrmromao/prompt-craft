import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileForm } from "@/app/profile/profile-form";
import { Role, PlanType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe("ProfileForm", () => {
  const mockUser = {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    role: "USER" as Role,
    planType: "FREE" as PlanType,
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

  const mockRouter = {
    refresh: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockClear();
    jest.clearAllMocks();
  });

  it("renders all form fields correctly", () => {
    render(<ProfileForm user={mockUser} />);

    // Check if all form fields are rendered
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/twitter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument();
  });

  it("pre-fills form fields with user data", () => {
    render(<ProfileForm user={mockUser} />);

    // Check if form fields are pre-filled with user data
    expect(screen.getByLabelText(/name/i)).toHaveValue(mockUser.name);
    expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email);
    expect(screen.getByLabelText(/bio/i)).toHaveValue(mockUser.bio);
    expect(screen.getByLabelText(/job title/i)).toHaveValue(mockUser.jobTitle);
    expect(screen.getByLabelText(/company/i)).toHaveValue(mockUser.company);
    expect(screen.getByLabelText(/location/i)).toHaveValue(mockUser.location);
    expect(screen.getByLabelText(/website/i)).toHaveValue(mockUser.website);
    expect(screen.getByLabelText(/twitter/i)).toHaveValue(mockUser.twitter);
    expect(screen.getByLabelText(/linkedin/i)).toHaveValue(mockUser.linkedin);
  });

  it("disables email field", () => {
    render(<ProfileForm user={mockUser} />);
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
  });

  it("shows loading state during form submission", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
    );

    render(<ProfileForm user={mockUser} />);
    
    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    // Check if button shows loading state
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });
  });

  it("handles successful form submission", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<ProfileForm user={mockUser} />);
    
    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mockUser.name,
          email: mockUser.email,
          bio: mockUser.bio,
          jobTitle: mockUser.jobTitle,
          location: mockUser.location,
          company: mockUser.company,
          website: mockUser.website,
          twitter: mockUser.twitter,
          linkedin: mockUser.linkedin,
        }),
      });
      expect(toast.success).toHaveBeenCalledWith("Profile updated successfully");
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it("handles form submission error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<ProfileForm user={mockUser} />);
    
    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to update profile. Please try again.");
    });
  });

  it("validates form fields", async () => {
    render(<ProfileForm user={mockUser} />);
    
    // Clear required fields
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    
    const submitButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitButton);

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });

    // Check if form submission was prevented
    expect(global.fetch).not.toHaveBeenCalled();
  });
}); 