import { EmailTemplateService } from '@/lib/services/EmailTemplateService';
import { revalidatePath } from 'next/cache';

export async function getEmailTemplates(searchParams: { search?: string; type?: string }) {
  try {
    const emailTemplateService = EmailTemplateService.getInstance();
    return await emailTemplateService.getEmailTemplates(searchParams);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return [];
  }
} {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return templates;
  } catch (error) {
    console.error('Error fetching email templates:', error);
    throw new Error('Failed to fetch email templates');
  }
}

export async function updateEmailTemplate(
  id: string,
  data: {
    name: string;
    subject: string;
    body: string;
    variables: string[];
    type: string;
    isActive: boolean;
  }
) {
  try {
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
        variables: data.variables,
        type: data.type,
        isActive: data.isActive,
      },
    });

    revalidatePath('/admin/email-templates');
    return template;
  } catch (error) {
    console.error('Error updating email template:', error);
    throw new Error('Failed to update email template');
  }
}

export async function deleteEmailTemplate(id: string) {
  try {
    await prisma.emailTemplate.delete({
      where: { id },
    });

    revalidatePath('/admin/email-templates');
  } catch (error) {
    console.error('Error deleting email template:', error);
    throw new Error('Failed to delete email template');
  }
}

export async function createEmailTemplate(data: {
  name: string;
  subject: string;
  body: string;
  variables: string[];
  type: string;
  isActive: boolean;
  createdById: string;
  updatedById: string;
}) {
  try {
    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
        variables: data.variables,
        type: data.type,
        isActive: data.isActive,
        createdById: data.createdById,
        updatedById: data.updatedById,
      },
    });

    revalidatePath('/admin/email-templates');
    return template;
  } catch (error) {
    console.error('Error creating email template:', error);
    throw new Error('Failed to create email template');
  }
}
