import { prisma } from '@/lib/prisma';

export interface TemplateFilters {
  type?: 'zero-shot' | 'few-shot' | 'chain-of-thought';
  complexity?: 'beginner' | 'intermediate' | 'advanced';
  search?: string;
  isPublic?: boolean;
}

export class TemplateService {
  async getTemplates(filters: TemplateFilters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.complexity) params.append('complexity', filters.complexity);
    if (filters.search) params.append('search', filters.search);
    if (filters.isPublic) params.append('isPublic', 'true');

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/templates?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
  }

  async getTemplateById(id: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/templates/${id}`);
    if (!response.ok) throw new Error('Failed to fetch template');
    return response.json();
  }

  async incrementUsage(id: string) {
    const response = await fetch(`/api/templates/${id}/usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to increment usage');
    return response.json();
  }

  async updateRating(id: string, rating: number, userId: string) {
    const template = await prisma.prompt.findUnique({
      where: { id },
      select: { ratings: true, usageCount: true },
    });``

    if (!template) throw new Error('Template not found');

    // Calculate new average rating
    const newRating = ((template.ratings.reduce((acc, curr) => acc + curr.overall, 0) * template.usageCount) + rating) / (template.usageCount + 1);

    return prisma.prompt.update({
      where: { id },
      data: {
        ratings: {
          create: {
            clarity: newRating,
            specificity: newRating,
            context: newRating,
            overall: newRating,
            feedback: '',
            userId: userId,
          },
        },
      },
    });
  }

  async getCategories() {
    const response = await fetch('/api/templates/categories');
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }

  async getPopularTags(limit = 20) {
    const response = await fetch(`/api/templates/tags?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch popular tags');
    return response.json();
  }

  async getPopularTemplates(limit = 5) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/templates/popular?limit=${limit}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch popular templates');
      }
      return response.json();
    } catch (error) {
      console.error('Error in getPopularTemplates:', error);
      throw new Error('Failed to fetch popular templates');
    }
  }
} 