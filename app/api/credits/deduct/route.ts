import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { AuditService } from '@/lib/services/auditService';
import { AuditAction } from '@/app/constants/audit';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { amount, reason, metadata } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid amount'
      }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({
        success: false,
        error: 'Reason required'
      }, { status: 400 });
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get current user credits
      const user = await tx.user.findUnique({
        where: { id: authResult.user.id },
        select: {
          monthlyCredits: true,
          purchasedCredits: true,
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const totalCredits = user.monthlyCredits + user.purchasedCredits;
      
      if (totalCredits < amount) {
        throw new Error('Insufficient credits');
      }

      // Deduct from purchased credits first, then monthly
      let remainingToDeduct = amount;
      let newPurchasedCredits = user.purchasedCredits;
      let newMonthlyCredits = user.monthlyCredits;

      if (user.purchasedCredits >= remainingToDeduct) {
        newPurchasedCredits -= remainingToDeduct;
        remainingToDeduct = 0;
      } else {
        remainingToDeduct -= user.purchasedCredits;
        newPurchasedCredits = 0;
        newMonthlyCredits -= remainingToDeduct;
      }

      // Update user credits
      const updatedUser = await tx.user.update({
        where: { id: authResult.user.id },
        data: {
          monthlyCredits: newMonthlyCredits,
          purchasedCredits: newPurchasedCredits,
        },
        select: {
          monthlyCredits: true,
          purchasedCredits: true,
        }
      });

      // Log the transaction
      await tx.creditTransaction.create({
        data: {
          userId: authResult.user.id,
          amount: -amount,
          type: 'DEDUCTION',
          reason,
          metadata: metadata ? JSON.stringify(metadata) : null,
          balanceAfter: updatedUser.monthlyCredits + updatedUser.purchasedCredits,
        }
      });

      return {
        monthlyCredits: updatedUser.monthlyCredits,
        purchasedCredits: updatedUser.purchasedCredits,
        totalCredits: updatedUser.monthlyCredits + updatedUser.purchasedCredits,
        deducted: amount
      };
    });

    // Audit log
    await AuditService.getInstance().logAction(
      authResult.user.id,
      AuditAction.CREDIT_DEDUCTION,
      { amount, reason, metadata }
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Credit deduction error:', error);
    
    if (error instanceof Error && error.message === 'Insufficient credits') {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Credit deduction failed'
    }, { status: 500 });
  }
}
