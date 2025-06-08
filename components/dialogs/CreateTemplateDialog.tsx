'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const templateFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  body: z.string().min(1, 'Body is required'),
  type: z.string().min(1, 'Type is required'),
  variables: z.string().min(1, 'At least one variable is required'),
});

type TemplateFormValues = {
  name: string;
  subject: string;
  body: string;
  type: string;
  variables: string;
};

interface CreateTemplateDialogProps {
  onTemplateCreated?: () => void;
  trigger?: React.ReactNode;
  template?: {
    id: string;
    name: string;
    subject: string;
    body: string;
    type: string;
    variables: string[];
  };
  mode?: 'create' | 'edit';
}

const TEMPLATE_TYPES = [
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'notification', label: 'Notification' },
  { value: 'alert', label: 'Alert' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'confirmation', label: 'Confirmation' },
  { value: 'custom', label: 'Custom' },
];

const SAMPLE_TEMPLATES = [
  {
    name: 'Welcome Email',
    subject: 'Welcome to {{companyName}} - Getting Started Guide',
    body: `Dear {{userName}},

Welcome to {{companyName}}! We're excited to have you on board.

Here are some quick steps to get started:
1. Complete your profile
2. Set up your preferences
3. Explore our features

If you have any questions, our support team is here to help.

Best regards,
{{companyName}} Team`,
    type: 'welcome',
    variables: 'userName, companyName',
  },
  {
    name: 'Ticket Confirmation',
    subject: 'Support Ticket #{{ticketId}} Received - {{ticketTitle}}',
    body: `Dear {{userName}},

Thank you for contacting our support team. We have received your ticket and will get back to you as soon as possible.

Ticket Details:
- Ticket ID: {{ticketId}}
- Subject: {{ticketTitle}}
- Priority: {{priority}}
- Status: {{status}}

We aim to respond to all tickets within 24 hours. You can track your ticket status by logging into your account.

Best regards,
{{companyName}} Support Team`,
    type: 'confirmation',
    variables: 'userName, ticketId, ticketTitle, priority, status, companyName',
  },
  {
    name: 'Ticket Update Notification',
    subject: 'Update on Your Support Ticket #{{ticketId}}',
    body: `Dear {{userName}},

There has been an update on your support ticket #{{ticketId}}.

Update Details:
- Status: {{status}}
- Updated by: {{agentName}}
- Update: {{updateMessage}}

You can view the full details by logging into your account.

Best regards,
{{companyName}} Support Team`,
    type: 'notification',
    variables: 'userName, ticketId, status, agentName, updateMessage, companyName',
  },
  {
    name: 'Ticket Resolution',
    subject: 'Your Support Ticket #{{ticketId}} Has Been Resolved',
    body: `Dear {{userName}},

We're pleased to inform you that your support ticket #{{ticketId}} has been resolved.

Resolution Details:
- Ticket: {{ticketTitle}}
- Resolution: {{resolution}}
- Resolved by: {{agentName}}

If you have any further questions or if the issue persists, please don't hesitate to create a new ticket.

Thank you for your patience.

Best regards,
{{companyName}} Support Team`,
    type: 'confirmation',
    variables: 'userName, ticketId, ticketTitle, resolution, agentName, companyName',
  },
  {
    name: 'Feedback Request',
    subject: 'How Was Your Support Experience? - Ticket #{{ticketId}}',
    body: `Dear {{userName}},

We hope your recent support ticket #{{ticketId}} was resolved to your satisfaction. We value your feedback and would appreciate if you could take a moment to rate your experience.

You can provide your feedback by clicking the link below:
{{feedbackLink}}

Your feedback helps us improve our services.

Best regards,
{{companyName}} Support Team`,
    type: 'reminder',
    variables: 'userName, ticketId, feedbackLink, companyName',
  },
];

export function CreateTemplateDialog({
  onTemplateCreated,
  trigger,
  template,
  mode = 'create',
}: CreateTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      subject: '',
      body: '',
      type: '',
      variables: '',
    },
  });

  useEffect(() => {
    if (template && mode === 'edit') {
      form.reset({
        name: template.name,
        subject: template.subject,
        body: template.body,
        type: template.type,
        variables: template.variables.join(', '),
      });
    }
  }, [template, mode, form]);

  const loadSampleTemplate = (template: (typeof SAMPLE_TEMPLATES)[0]) => {
    form.reset({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type,
      variables: template.variables,
    });
  };

  async function onSubmit(data: TemplateFormValues) {
    try {
      const endpoint =
        mode === 'edit' && template
          ? `/api/email-templates/${template.id}`
          : '/api/email-templates';

      const response = await fetch(endpoint, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          variables: data.variables.split(',').map(v => v.trim()),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `Failed to ${mode} template`);
      }

      toast({
        title: 'Success',
        description: `Template ${mode === 'edit' ? 'updated' : 'created'} successfully`,
      });

      form.reset();
      setOpen(false);
      onTemplateCreated?.();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : `Failed to ${mode} template. Please try again.`,
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>{mode === 'edit' ? 'Edit Template' : 'Create Template'}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Email Template' : 'Create New Email Template'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Edit your existing email template.'
              : 'Create a new email template that can be used for sending automated emails.'}
          </DialogDescription>
        </DialogHeader>
        {mode === 'create' && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium">Sample Templates</h3>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_TEMPLATES.map(template => (
                <Button
                  key={template.name}
                  variant="outline"
                  className="justify-start"
                  onClick={() => loadSampleTemplate(template)}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter template name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email subject" {...field} />
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
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TEMPLATE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="variables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variables (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., name, email, company" {...field} />
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
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter email body content" className="h-40" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {mode === 'edit' ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
