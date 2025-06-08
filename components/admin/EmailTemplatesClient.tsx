'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { CreateTemplateDialog } from '@/components/dialogs/CreateTemplateDialog';
import type { EmailTemplate } from '@prisma/client';

interface EmailTemplatesClientProps {
  templates: EmailTemplate[];
}

export function EmailTemplatesClient({ templates }: EmailTemplatesClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Email Templates</h1>
        <CreateTemplateDialog
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          }
          onTemplateCreated={() => {
            // Refresh the page to show the new template
            window.location.reload();
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-gray-500">No email templates found. Create one to get started.</p>
          ) : (
            <ul className="space-y-4">
              {templates.map((template: EmailTemplate) => (
                <li
                  key={template.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.subject}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/admin/email-templates/${template.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
