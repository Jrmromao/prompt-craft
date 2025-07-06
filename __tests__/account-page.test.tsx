import React from 'react';
import { render, screen, act } from '@testing-library/react';
import AccountPage from '@/app/account/page';
import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { getProfileByClerkId } from '@/app/services/profileService';
import { Role, PlanType } from '@prisma/client';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

// Mock profile service
jest.mock('@/app/services/profileService', () => ({
  getProfileByClerkId: jest.fn(),
}));

// Correctly mock the named export for ProfileClient
jest.mock('@/app/account/ProfileClient', () => ({
  __esModule: true,
  ProfileClient: ({ user }: { user: any }) => (
    <div>
      <h2>Personal Information</h2>
      <div>{user.name}</div>
      <div>{user.email}</div>
      <div>{user.bio}</div>
      <h2>Professional Information</h2>
      <div>{user.jobTitle}</div>
      <div>{user.company}</div>
      <div>{user.location}</div>
      <h2>Social Links</h2>
      <div>{user.website}</div>
      <div>{user.twitter}</div>
      <div>{user.linkedin}</div>
    </div>
  ),
}));

describe('AccountPage', () => {
  const mockUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    imageUrl: 'https://example.com/avatar.jpg',
    role: 'USER' as Role,
    planType: 'FREE' as PlanType,
    credits: 100,
    creditCap: 1000,
    bio: 'Test bio',
    jobTitle: 'Software Engineer',
    location: 'San Francisco',
    company: 'Test Company',
    website: 'https://example.com',
    twitter: '@johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders profile page with user data', async () => {
    const mockAuth = auth as unknown as jest.Mock;
    const mockCurrentUser = currentUser as unknown as jest.Mock;

    mockAuth.mockResolvedValueOnce({ userId: 'user-123' });
    mockCurrentUser.mockResolvedValueOnce({
      id: 'user-123',
      imageUrl: 'https://example.com/avatar.jpg',
    });
    (getProfileByClerkId as jest.Mock).mockResolvedValueOnce(mockUser);

    let page;
    await act(async () => {
      page = await AccountPage();
    });
    render(page);

    // Check if profile form is rendered
    expect(screen.getByText(/personal information/i)).toBeInTheDocument();
    expect(screen.getByText(/professional information/i)).toBeInTheDocument();
    expect(screen.getByText(/social links/i)).toBeInTheDocument();

    // Check if user data is displayed
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.bio)).toBeInTheDocument();
    expect(screen.getByText(mockUser.jobTitle)).toBeInTheDocument();
    expect(screen.getByText(mockUser.company)).toBeInTheDocument();
    expect(screen.getByText(mockUser.location)).toBeInTheDocument();
    expect(screen.getByText(mockUser.website)).toBeInTheDocument();
    expect(screen.getByText(mockUser.twitter)).toBeInTheDocument();
    expect(screen.getByText(mockUser.linkedin)).toBeInTheDocument();
  });
});
