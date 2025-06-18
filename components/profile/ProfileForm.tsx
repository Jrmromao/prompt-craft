'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { trackUserFlowError, trackUserFlowEvent } from '@/lib/error-tracking';

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
    role: string;
    plan: {
      name: string;
      type: string;
    };
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      trackUserFlowEvent('profile_update', 'start_update', { userId: user.id });
      
      if (clerkUser) {
        await clerkUser.update({
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' '),
        });
      }

      trackUserFlowEvent('profile_update', 'update_success', { userId: user.id });
      toast.success('Profile updated successfully');
      router.refresh();
    } catch (error) {
      trackUserFlowError('profile_update', error as Error, { 
        userId: user.id,
        formData 
      });
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      trackUserFlowEvent('profile_delete', 'start_delete', { userId: user.id });
      
      const response = await fetch('/api/profile', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      trackUserFlowEvent('profile_delete', 'delete_success', { userId: user.id });
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error) {
      trackUserFlowError('profile_delete', error as Error, { userId: user.id });
      toast.error('Failed to delete account');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} disabled className="bg-muted" />
            <p className="mt-1 text-sm text-muted-foreground">Email cannot be changed</p>
          </div>

          <div>
            <Label>Current Plan</Label>
            <div className="mt-1 text-sm">
              {user.plan.name} ({user.plan.type})
            </div>
          </div>

          <div>
            <Label>Role</Label>
            <div className="mt-1 text-sm capitalize">{user.role}</div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
