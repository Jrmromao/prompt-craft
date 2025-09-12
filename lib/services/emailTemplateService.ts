import { prisma } from '@/lib/prisma';
import { ServiceError } from './types';
import { EmailTemplate } from '@prisma/client';

interface EmailTemplateWithUser extends EmailTemplate {
  createdBy: { name: string | null };
  updatedBy: { name: string | null };
}

interface EmailTemplateFilters {
  search?: string;
  type?: string;
}

export class EmailTemplateService {
  private static instance: EmailTemplateService;

  private constructor() {}

  public static getInstance(): EmailTemplateService {
    if (!EmailTemplateService.instance) {
      EmailTemplateService.instance = new EmailTemplateService();
    }
    return EmailTemplateService.instance;
  }

  async getEmailTemplates(filters: EmailTemplateFilters = {}): Promise<EmailTemplateWithUser[]> {
    try {
      const { search, type } = filters;

      const templates = await prisma.emailTemplate.findMany({
        where: {
          AND: [
            search
              ? {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { subject: { contains: search, mode: 'insensitive' } },
                  ],
                }
              : {},
            type ? { type } : {},
          ],
        },
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
          updatedBy: {
            select: {
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
      throw new ServiceError('Failed to get email templates', 'EMAIL_TEMPLATE_FETCH_FAILED', 500);
    }
  }

  async getEmailTemplateById(id: string): Promise<EmailTemplateWithUser | null> {
    try {
      return await prisma.emailTemplate.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
          updatedBy: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new ServiceError('Failed to get email template', 'EMAIL_TEMPLATE_NOT_FOUND', 404);
    }
  }

  async createEmailTemplate(data: {
    name: string;
    subject: string;
    body: string;
    type: string;
    variables: string[];
    createdById: string;
    updatedById: string;
  }): Promise<EmailTemplate> {
    try {
      return await prisma.emailTemplate.create({
        data,
      });
    } catch (error) {
      throw new ServiceError('Failed to create email template', 'EMAIL_TEMPLATE_CREATE_FAILED', 500);
    }
  }

  async updateEmailTemplate(id: string, data: {
    name?: string;
    subject?: string;
    body?: string;
    type?: string;
    variables?: string[];
    updatedById: string;
    isActive?: boolean;
  }): Promise<EmailTemplate> {
    try {
      return await prisma.emailTemplate.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new ServiceError('Failed to update email template', 'EMAIL_TEMPLATE_UPDATE_FAILED', 500);
    }
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    try {
      await prisma.emailTemplate.delete({
        where: { id },
      });
    } catch (error) {
      throw new ServiceError('Failed to delete email template', 'EMAIL_TEMPLATE_DELETE_FAILED', 500);
    }
  }
}
