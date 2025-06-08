import { prisma } from '@/lib/prisma';
import type { EmailTemplate } from '@prisma/client';

export async function getAllEmailTemplates() {
  return prisma.emailTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEmailTemplateById(id: string) {
  return prisma.emailTemplate.findUnique({
    where: { id },
  });
}

export async function createEmailTemplate(
  data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>
) {
  return prisma.emailTemplate.create({
    data,
  });
}

export async function updateEmailTemplate(id: string, data: Partial<EmailTemplate>) {
  return prisma.emailTemplate.update({
    where: { id },
    data,
  });
}

export async function deleteEmailTemplate(id: string) {
  return prisma.emailTemplate.delete({
    where: { id },
  });
}
