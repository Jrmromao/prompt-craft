'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { name: string | null };
  updatedBy: { name: string | null };
}

interface EmailTemplateListProps {
  templates: EmailTemplate[];
}

export function EmailTemplateList({ templates }: EmailTemplateListProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      // Refresh the page to show updated list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Updated By</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map(template => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>{template.type}</TableCell>
              <TableCell>
                <Badge variant={template.isActive ? 'default' : 'secondary'}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(template.updatedAt), 'MMM d, yyyy HH:mm')}</TableCell>
              <TableCell>{template.updatedBy.name || 'Unknown'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(template)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
