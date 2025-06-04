'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const onboardingSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  role: z.enum(['USER', 'ADMIN']),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  userId: string;
}

export function OnboardingForm({ userId }: OnboardingFormProps) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: clerkUser?.fullName || '',
      displayName: clerkUser?.firstName || '',
      role: 'USER',
    },
  });

  const onSubmit = async (data: OnboardingFormValues) => {
    setIsLoading(true);

    try {
      // Update Clerk user profile
      if (clerkUser) {
        await clerkUser.update({
          firstName: data.displayName,
          lastName: data.fullName.split(' ').slice(1).join(' '),
        });
      }

      // Update user in database
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      toast.success('Profile setup complete!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error during onboarding:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              {...form.register('fullName')}
              disabled={isLoading}
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              {...form.register('displayName')}
              disabled={isLoading}
            />
            {form.formState.errors.displayName && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.displayName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobTitle">Job Title (Optional)</Label>
              <Input
                id="jobTitle"
                {...form.register('jobTitle')}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="department">Department (Optional)</Label>
              <Input
                id="department"
                {...form.register('department')}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              {...form.register('bio')}
              disabled={isLoading}
              className="resize-none"
            />
            {form.formState.errors.bio && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.bio.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              onValueChange={(value) => form.setValue('role', value as 'USER' | 'ADMIN')}
              defaultValue={form.getValues('role')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Setting up...' : 'Complete Setup'}
        </Button>
      </div>
    </form>
  );
} 