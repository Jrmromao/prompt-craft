import { prisma } from '@/lib/prisma';

export class CreditPackageService {
  /**
   * Get all active credit packages
   */
  static async getActivePackages() {
    return prisma.creditPackage.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
    });
  }

  /**
   * Get a credit package by its Stripe price ID
   */
  static async getPackageByStripePriceId(stripePriceId: string) {
    return prisma.creditPackage.findUnique({
      where: {
        stripePriceId,
      },
    });
  }

  /**
   * Create a new credit package
   */
  static async createPackage(data: {
    name: string;
    amount: number;
    price: number;
    stripePriceId: string;
    description?: string;
    isPopular?: boolean;
    bonusCredits?: number;
  }) {
    return prisma.creditPackage.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  /**
   * Update a credit package
   */
  static async updatePackage(
    id: string,
    data: {
      name?: string;
      amount?: number;
      price?: number;
      stripePriceId?: string;
      description?: string;
      isPopular?: boolean;
      bonusCredits?: number;
      isActive?: boolean;
    }
  ) {
    return prisma.creditPackage.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a credit package (soft delete by setting isActive to false)
   */
  static async deletePackage(id: string) {
    return prisma.creditPackage.update({
      where: { id },
      data: { isActive: false },
    });
  }
} 