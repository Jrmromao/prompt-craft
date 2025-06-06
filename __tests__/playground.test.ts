// import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
// import { prisma } from '@/lib/prisma';
// import { auth } from '@clerk/nextjs/server';

// // Mock Clerk auth
// vi.mock('@clerk/nextjs/server', () => ({
//   auth: vi.fn().mockResolvedValue({ userId: 'test-clerk-id' })
// }));

// describe('Playground Feature', () => {
//   let testUser: any;
//   const testPrompt = "Write a short poem about coding";

//   beforeAll(async () => {
//     // Create a test user
//     testUser = await prisma.user.create({
//       data: {
//         clerkId: 'test-clerk-id',
//         email: 'test@example.com',
//         name: 'Test User',
//         planType: 'FREE'
//       }
//     });
//   });

//   afterAll(async () => {
//     // Clean up test data
//     await prisma.playgroundRun.deleteMany({
//       where: { userId: testUser.id }
//     });
//     await prisma.user.delete({
//       where: { id: testUser.id }
//     });
//   });

//   describe('API Endpoint', () => {
//     it('should return 401 for unauthorized requests', async () => {
//       // Mock auth to return undefined (unauthorized)
//       vi.mocked(auth).mockResolvedValueOnce(undefined as any);

//       const response = await fetch('/api/ai/run', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: testPrompt })
//       });
//       expect(response.status).toBe(401);
//     });

//     it('should return 400 for missing prompt', async () => {
//       const response = await fetch('/api/ai/run', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({})
//       });
//       expect(response.status).toBe(400);
//     });

//     it('should create a playground run and return result', async () => {
//       const response = await fetch('/api/ai/run', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: testPrompt })
//       });

//       expect(response.status).toBe(200);
//       const data = await response.json();
//       expect(data.result).toBeDefined();

//       // Verify run was recorded
//       const run = await prisma.playgroundRun.findFirst({
//         where: { userId: testUser.id }
//       });
//       expect(run).toBeDefined();
//       expect(run?.prompt).toBe(testPrompt);
//       expect(run?.status).toBe('SUCCESS');
//     });

//     it('should enforce monthly run limits', async () => {
//       // Create 20 runs (FREE tier limit)
//       for (let i = 0; i < 20; i++) {
//         await prisma.playgroundRun.create({
//           data: {
//             userId: testUser.id,
//             prompt: `Test prompt ${i}`,
//             result: 'Test result',
//             status: 'SUCCESS'
//           }
//         });
//       }

//       // Try to create one more run
//       const response = await fetch('/api/ai/run', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: testPrompt })
//       });

//       expect(response.status).toBe(429);
//       const data = await response.json();
//       expect(data.error).toBe('Playground run limit exceeded');
//     });
//   });

//   describe('Usage Tracking', () => {
//     it('should track runs per user', async () => {
//       const runs = await prisma.playgroundRun.count({
//         where: { userId: testUser.id }
//       });
//       expect(runs).toBeGreaterThan(0);
//     });

//     it('should track runs per month', async () => {
//       const startOfMonth = new Date();
//       startOfMonth.setDate(1);
//       startOfMonth.setHours(0, 0, 0, 0);

//       const monthlyRuns = await prisma.playgroundRun.count({
//         where: {
//           userId: testUser.id,
//           createdAt: {
//             gte: startOfMonth
//           }
//         }
//       });
//       expect(monthlyRuns).toBeGreaterThan(0);
//     });
//   });

//   describe('Plan Type Limits', () => {
//     it('should allow unlimited runs for PRO users', async () => {
//       // Update user to PRO plan
//       await prisma.user.update({
//         where: { id: testUser.id },
//         data: { planType: 'PRO' }
//       });

//       // Create 50 runs (should be allowed for PRO)
//       for (let i = 0; i < 50; i++) {
//         const response = await fetch('/api/ai/run', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ prompt: `Test prompt ${i}` })
//         });
//         expect(response.status).toBe(200);
//       }

//       // Verify all runs were created
//       const runs = await prisma.playgroundRun.count({
//         where: { userId: testUser.id }
//       });
//       expect(runs).toBeGreaterThanOrEqual(50);
//     });
//   });
// });
