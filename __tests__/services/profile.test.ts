import { prisma } from "@/lib/prisma";
import { getProfileByClerkId, updateProfile } from "@/app/services/profileService";

// Mock Prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("Profile Service", () => {
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfileByClerkId", () => {
    it("returns null if user is not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const result = await getProfileByClerkId("non-existent-id");
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: "non-existent-id" },
      });
    });

    it("returns user profile if found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await getProfileByClerkId("user-123");
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: "user-123" },
      });
    });

    it("handles database errors", async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );

      await expect(getProfileByClerkId("user-123")).rejects.toThrow("Database error");
    });
  });

  describe("updateProfile", () => {
    const updateData = {
      name: "New Name",
      bio: "New bio",
      jobTitle: "New job title",
    };

    it("updates user profile successfully", async () => {
      const updatedUser = { ...mockUser, ...updateData };
      (prisma.user.update as jest.Mock).mockResolvedValueOnce(updatedUser);

      const result = await updateProfile("user-123", updateData);
      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { clerkId: "user-123" },
        data: updateData,
      });
    });

    it("handles database errors", async () => {
      (prisma.user.update as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );

      await expect(updateProfile("user-123", updateData)).rejects.toThrow(
        "Database error"
      );
    });

    it("validates update data", async () => {
      const invalidData = {
        invalidField: "value",
      };

      await expect(updateProfile("user-123", invalidData)).rejects.toThrow();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
}); 