'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['BUG', 'FEATURE_REQUEST', 'GENERAL_INQUIRY', 'TECHNICAL_SUPPORT', 'BILLING']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export function TicketForm() {
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated
  if (isLoaded && !isSignedIn) {
    router.push('/sign-in?redirect_url=/support/new');
    return null;
  }

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'GENERAL_INQUIRY',
      priority: 'MEDIUM',
    },
  });

  const onSubmit = async (data: TicketFormValues) => {
    if (!userId) {
      console.log('Form submission blocked: No user ID');
      toast.error('You must be signed in to create a support ticket');
      router.push('/sign-in?redirect_url=/support/new');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Form submission started with data:', { ...data, userId });

      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('API response received:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to create ticket');
      }

      const responseData = await response.json();
      console.log('Ticket created successfully:', responseData);

      toast.success('Ticket created successfully');
      router.push('/support/tickets');
    } catch (error) {
      console.error(
        'Form submission error:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      toast.error(error instanceof Error ? error.message : 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl rounded-xl border border-gray-200 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Create Support Ticket</CardTitle>
        <CardDescription>Fill out the form below to create a new support ticket.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ticket title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your issue or request"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BUG">Bug Report</SelectItem>
                        <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                        <SelectItem value="GENERAL_INQUIRY">General Inquiry</SelectItem>
                        <SelectItem value="TECHNICAL_SUPPORT">Technical Support</SelectItem>
                        <SelectItem value="BILLING">Billing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
