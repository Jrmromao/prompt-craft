'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const templateTypes = [
  'TICKET_CREATED',
  'TICKET_ASSIGNED',
  'TICKET_IN_PROGRESS',
  'TICKET_RESOLVED',
  'TICKET_CLOSED',
  'WELCOME_EMAIL',
  'SECURITY_ALERT',
] as const;

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  type: z.enum(templateTypes),
  isActive: z.boolean().default(true),
  variables: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface EmailTemplateFormProps {
  template?: {
    id: string;
    name: string;
    subject: string;
    body: string;
    type: (typeof templateTypes)[number];
    isActive: boolean;
    variables: string[];
  };
}

export function EmailTemplateForm({ template }: EmailTemplateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: template || {
      name: '',
      subject: '',
      body: '',
      type: 'TICKET_CREATED',
      isActive: true,
      variables: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const url = template
        ? `/api/admin/email-templates/${template.id}`
        : '/api/admin/email-templates';
      const method = template ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      toast.success(template ? 'Template updated successfully' : 'Template created successfully');
      form.reset();
      window.location.reload();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-semibold">
        {template ? 'Edit Template' : 'Create New Template'}
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter template name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templateTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email subject" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Body</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter email body" className="min-h-[200px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                  <div className="text-sm text-gray-500">Enable or disable this template</div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
