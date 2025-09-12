import { EmailTemplateService } from '@/lib/services/emailTemplateService';
import { revalidatePath } from 'next/cache';

export async function getEmailTemplates(searchParams: { search?: string; type?: string }) {
  try {
    const emailTemplateService = EmailTemplateService.getInstance();
    return await emailTemplateService.getEmailTemplates(searchParams);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return [];
  }
}

export async function createEmailTemplate(data: {
  name: string;
  subject: string;
  body: string;
  type: string;
  variables: string[];
  createdById: string;
  updatedById: string;
}) {
  try {
    const emailTemplateService = EmailTemplateService.getInstance();
    const template = await emailTemplateService.createEmailTemplate(data);
    revalidatePath('/admin/email-templates');
    return template;
  } catch (error) {
    console.error('Error creating email template:', error);
    throw new Error('Failed to create email template');
  }
}

export async function updateEmailTemplate(id: string, data: {
  name?: string;
  subject?: string;
  body?: string;
  type?: string;
  variables?: string[];
  updatedById: string;
  isActive?: boolean;
}) {
  try {
    const emailTemplateService = EmailTemplateService.getInstance();
    const template = await emailTemplateService.updateEmailTemplate(id, data);
    revalidatePath('/admin/email-templates');
    return template;
  } catch (error) {
    console.error('Error updating email template:', error);
    throw new Error('Failed to update email template');
  }
}

export async function deleteEmailTemplate(id: string) {
  try {
    const emailTemplateService = EmailTemplateService.getInstance();
    await emailTemplateService.deleteEmailTemplate(id);
    revalidatePath('/admin/email-templates');
  } catch (error) {
    console.error('Error deleting email template:', error);
    throw new Error('Failed to delete email template');
  }
}
