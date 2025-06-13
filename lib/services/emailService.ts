import { Resend } from 'resend';
import { Category, Priority, TicketStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const EMAIL_TEMPLATES = {
  WELCOME: {
    subject: 'Welcome to PromptHive! 🎉',
    html: (name: string) => `
      <h1>Welcome to PromptHive, ${name}!</h1>
      <p>We're excited to have you on board. Get ready to create amazing prompts and enhance your AI interactions.</p>
      <p>Here are a few things you can do to get started:</p>
      <ul>
        <li>Create your first prompt</li>
        <li>Explore our templates</li>
        <li>Join our community</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    `,
  },
  SECURITY_ALERT: {
    subject: 'Security Alert: New Login Detected - PromptHive',
    html: (name: string, location: string, device: string) => `
      <h1>Security Alert</h1>
      <p>Hello ${name},</p>
      <p>We detected a new login to your PromptHive account from:</p>
      <ul>
        <li>Location: ${location}</li>
        <li>Device: ${device}</li>
      </ul>
      <p>If this was you, you can ignore this email. If not, please secure your account immediately.</p>
    `,
  },
  SUBSCRIPTION_RENEWAL: {
    subject: 'Your PromptHive Subscription is Renewing Soon',
    html: (name: string, planName: string, renewalDate: string) => `
      <h1>Subscription Renewal Reminder</h1>
      <p>Hello ${name},</p>
      <p>Your ${planName} subscription will renew on ${renewalDate}.</p>
      <p>Make sure your payment method is up to date to avoid any interruption in service.</p>
    `,
  },
  CREDIT_UPDATE: {
    subject: 'Your PromptHive Credits Have Been Updated',
    html: (name: string, newBalance: number, reason: string) => `
      <h1>Credit Balance Update</h1>
      <p>Hello ${name},</p>
      <p>Your credit balance has been updated:</p>
      <ul>
        <li>New Balance: ${newBalance} credits</li>
        <li>Reason: ${reason}</li>
      </ul>
    `,
  },
  GDPR_DATA_EXPORT: {
    subject: 'Your PromptHive Data Export',
    html: (name: string) => `
      <h1>Data Export Confirmation</h1>
      <p>Hello ${name},</p>
      <p>Your data export request has been processed successfully. You can download your data from the link below.</p>
      <p>This export contains all your personal data stored in PromptHive, including:</p>
      <ul>
        <li>Account information</li>
        <li>Activity history</li>
        <li>Consent records</li>
        <li>Usage data</li>
      </ul>
      <p>If you did not request this export, please contact our support team immediately.</p>
    `,
  },
  GDPR_ACCOUNT_DELETION: {
    subject: 'Your PromptHive Account Deletion Request',
    html: (name: string) => `
      <h1>Account Deletion Request Received</h1>
      <p>Hello ${name},</p>
      <p>We have received your request to delete your PromptHive account.</p>
      <p>Your account and associated data will be permanently deleted within 30 days, as required by GDPR.</p>
      <p>During this period, you can still access your account. If you wish to cancel the deletion request, please contact our support team.</p>
      <p>After deletion, you will not be able to recover your data.</p>
    `,
  },
  GDPR_CONSENT_CHANGE: {
    subject: 'Your PromptHive Consent Preferences Updated',
    html: (name: string, changes: { purpose: string; granted: boolean }[]) => `
      <h1>Consent Preferences Updated</h1>
      <p>Hello ${name},</p>
      <p>Your consent preferences have been updated:</p>
      <ul>
        ${changes.map(change => `
          <li>${change.purpose}: ${change.granted ? 'Granted' : 'Withdrawn'}</li>
        `).join('')}
      </ul>
      <p>You can update these preferences at any time from your privacy settings.</p>
    `,
  },
  GDPR_DATA_RECTIFICATION: {
    subject: 'Your PromptHive Data Update Confirmation',
    html: (name: string, changes: string[]) => `
      <h1>Data Update Confirmation</h1>
      <p>Hello ${name},</p>
      <p>Your personal data has been updated successfully:</p>
      <ul>
        ${changes.map(change => `<li>${change}</li>`).join('')}
      </ul>
      <p>If you did not make these changes, please contact our support team immediately.</p>
    `,
  },
  PROMPT_CREATED: {
    subject: 'Your New Prompt Has Been Created - PromptHive',
    html: (name: string, promptTitle: string) => `
      <h1>Prompt Created Successfully</h1>
      <p>Hello ${name},</p>
      <p>Your prompt "${promptTitle}" has been created successfully on PromptHive.</p>
      <p>You can now use this prompt in your projects or share it with the community.</p>
    `,
  },
  PROMPT_UPDATED: {
    subject: 'Your Prompt Has Been Updated - PromptHive',
    html: (name: string, promptTitle: string) => `
      <h1>Prompt Updated Successfully</h1>
      <p>Hello ${name},</p>
      <p>Your prompt "${promptTitle}" has been updated successfully on PromptHive.</p>
      <p>The changes are now live and available for use.</p>
    `,
  },
  PROMPT_DELETED: {
    subject: 'Your Prompt Has Been Deleted - PromptHive',
    html: (name: string, promptTitle: string) => `
      <h1>Prompt Deleted</h1>
      <p>Hello ${name},</p>
      <p>Your prompt "${promptTitle}" has been deleted successfully from PromptHive.</p>
      <p>This action cannot be undone. If you need to recover this prompt, please contact support within 30 days.</p>
    `,
  },
  PROMPT_SHARED: {
    subject: 'Your Prompt Has Been Shared - PromptHive',
    html: (name: string, promptTitle: string, sharedBy: string) => `
      <h1>Prompt Shared</h1>
      <p>Hello ${name},</p>
      <p>Your prompt "${promptTitle}" has been shared by ${sharedBy} on PromptHive.</p>
      <p>You can view the sharing details in your dashboard.</p>
    `,
  },
  PROMPT_COMMENTED: {
    subject: 'New Comment on Your Prompt - PromptHive',
    html: (name: string, promptTitle: string, commenter: string, comment: string) => `
      <h1>New Comment</h1>
      <p>Hello ${name},</p>
      <p>${commenter} has commented on your prompt "${promptTitle}" on PromptHive:</p>
      <blockquote>${comment}</blockquote>
      <p>You can view and respond to this comment in your dashboard.</p>
    `,
  },
  PROMPT_VOTED: {
    subject: 'Your Prompt Received a Vote - PromptHive',
    html: (name: string, promptTitle: string, voter: string, voteType: 'up' | 'down') => `
      <h1>New Vote</h1>
      <p>Hello ${name},</p>
      <p>${voter} has ${voteType === 'up' ? 'upvoted' : 'downvoted'} your prompt "${promptTitle}" on PromptHive.</p>
      <p>You can view the voting details in your dashboard.</p>
    `,
  },
  API_KEY_CREATED: {
    subject: 'New API Key Created - PromptHive',
    html: (name: string, keyName: string) => `
      <h1>API Key Created</h1>
      <p>Hello ${name},</p>
      <p>A new API key "${keyName}" has been created for your PromptHive account.</p>
      <p>Please keep this key secure and never share it with anyone.</p>
    `,
  },
  API_KEY_REVOKED: {
    subject: 'API Key Revoked - PromptHive',
    html: (name: string, keyName: string) => `
      <h1>API Key Revoked</h1>
      <p>Hello ${name},</p>
      <p>Your API key "${keyName}" has been revoked from your PromptHive account.</p>
      <p>If you did not revoke this key, please contact support immediately.</p>
    `,
  },
  PROFILE_UPDATED: {
    subject: 'Profile Updated - PromptHive',
    html: (name: string, changes: string[]) => `
      <h1>Profile Update Confirmation</h1>
      <p>Hello ${name},</p>
      <p>Your PromptHive profile has been updated with the following changes:</p>
      <ul>
        ${changes.map(change => `<li>${change}</li>`).join('')}
      </ul>
      <p>If you did not make these changes, please contact support immediately.</p>
    `,
  },
  PASSWORD_CHANGED: {
    subject: 'Password Changed - PromptHive',
    html: (name: string, location: string, device: string) => `
      <h1>Password Changed</h1>
      <p>Hello ${name},</p>
      <p>Your PromptHive account password has been changed successfully.</p>
      <p>Details:</p>
      <ul>
        <li>Location: ${location}</li>
        <li>Device: ${device}</li>
      </ul>
      <p>If you did not make this change, please contact support immediately.</p>
    `,
  },
  TWO_FACTOR_ENABLED: {
    subject: 'Two-Factor Authentication Enabled - PromptHive',
    html: (name: string) => `
      <h1>Two-Factor Authentication Enabled</h1>
      <p>Hello ${name},</p>
      <p>Two-factor authentication has been enabled for your PromptHive account.</p>
      <p>Your account is now more secure. You'll need to enter a verification code each time you log in.</p>
    `,
  },
  TWO_FACTOR_DISABLED: {
    subject: 'Two-Factor Authentication Disabled - PromptHive',
    html: (name: string) => `
      <h1>Two-Factor Authentication Disabled</h1>
      <p>Hello ${name},</p>
      <p>Two-factor authentication has been disabled for your PromptHive account.</p>
      <p>Your account is now less secure. We recommend keeping 2FA enabled for better security.</p>
    `,
  },
  PLAN_CHANGED: {
    subject: 'Subscription Plan Changed - PromptHive',
    html: (name: string, oldPlan: string, newPlan: string) => `
      <h1>Plan Change Confirmation</h1>
      <p>Hello ${name},</p>
      <p>Your PromptHive subscription plan has been changed:</p>
      <ul>
        <li>From: ${oldPlan}</li>
        <li>To: ${newPlan}</li>
      </ul>
      <p>The changes will take effect immediately.</p>
    `,
  },
  PAYMENT_FAILED: {
    subject: 'Payment Failed - PromptHive',
    html: (name: string, planName: string, error: string) => `
      <h1>Payment Failed</h1>
      <p>Hello ${name},</p>
      <p>We were unable to process your payment for the ${planName} plan on PromptHive.</p>
      <p>Error: ${error}</p>
      <p>Please update your payment method to avoid service interruption.</p>
    `,
  },
  PAYMENT_SUCCEEDED: {
    subject: 'Payment Successful - PromptHive',
    html: (name: string, planName: string, amount: string) => `
      <h1>Payment Successful</h1>
      <p>Hello ${name},</p>
      <p>Your payment of ${amount} for the ${planName} plan on PromptHive has been processed successfully.</p>
      <p>Thank you for your continued support!</p>
    `,
  },
} as const;

interface EmailOptions {
  email: string;
  subject: string;
  html: string;
}

interface UsageAlertOptions {
  email: string;
  feature: string;
  usage: number;
  limit: number;
}

interface PaymentFailureOptions {
  email: string;
  error: string;
}

interface GDPRConsentChangeOptions {
  email: string;
  name: string;
  changes: { purpose: string; granted: boolean }[];
}

interface GDPRDataRectificationOptions {
  email: string;
  name: string;
  changes: string[];
}

interface PromptNotificationOptions {
  email: string;
  name: string;
  promptTitle: string;
  sharedBy?: string;
  commenter?: string;
  comment?: string;
  voter?: string;
  voteType?: 'up' | 'down';
}

interface APIKeyNotificationOptions {
  email: string;
  name: string;
  keyName: string;
}

interface ProfileUpdateOptions {
  email: string;
  name: string;
  changes: string[];
}

interface SecurityNotificationOptions {
  email: string;
  name: string;
  location: string;
  device: string;
}

interface PlanChangeOptions {
  email: string;
  name: string;
  oldPlan: string;
  newPlan: string;
}

interface PaymentNotificationOptions {
  email: string;
  name: string;
  planName: string;
  amount?: string;
  error?: string;
}

export class EmailService {
  private static instance: EmailService;
  private resend: Resend;

  private constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async getTemplate(type: string) {
    const template = await prisma.emailTemplate.findFirst({
      where: {
        type,
        isActive: true,
      },
    });

    if (!template) {
      throw new Error(`No active template found for type: ${type}`);
    }

    return template;
  }

  public async sendEmail({ email, subject, html }: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      await this.resend.emails.send({
        from: 'PromptCraft <noreply@promptcraft.ai>',
        to: email,
        subject,
        html,
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
    }
  }

  public async sendUsageAlert({ email, feature, usage, limit }: UsageAlertOptions): Promise<{ success: boolean; error?: string }> {
    const percentage = Math.round((usage / limit) * 100);
    const subject = `Usage Alert: ${percentage}% of ${feature} limit reached`;
    const html = `
      <h1>Usage Alert</h1>
      <p>You have used ${percentage}% of your ${feature} limit.</p>
      <p>Current usage: ${usage}/${limit}</p>
      <p>Consider upgrading your plan to avoid service interruptions.</p>
    `;
    return this.sendEmail({ email, subject, html });
  }

  public async sendPaymentFailureAlert({ email, error }: PaymentFailureOptions): Promise<{ success: boolean; error?: string }> {
    if (!this.validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    const errorMessage = error || 'Unknown error';
    const subject = 'Payment Failed - Action Required';
    const html = `
      <h1>Payment Failed</h1>
      <p>We were unable to process your recent payment.</p>
      <p>Error: ${errorMessage}</p>
      <p>Please update your payment method to avoid service interruptions.</p>
    `;
    return this.sendEmail({ email, subject, html });
  }

  public async sendTicketCreatedNotification(
    to: string,
    userName: string,
    ticketId: string,
    ticketTitle: string,
    category: string,
    priority: string,
    description: string
  ) {
    const template = await this.getTemplate('TICKET_CREATED');
    const html = template.body
      .replace('{{userName}}', userName)
      .replace('{{ticketId}}', ticketId)
      .replace('{{ticketTitle}}', ticketTitle)
      .replace('{{category}}', category)
      .replace('{{priority}}', priority)
      .replace('{{description}}', description);

    return this.sendEmail({ email: to, subject: template.subject, html });
  }

  public async sendTicketInProgressNotification(
    to: string,
    userName: string,
    ticketId: string,
    ticketTitle: string,
    comment?: string
  ) {
    const template = await this.getTemplate('TICKET_IN_PROGRESS');
    const html = template.body
      .replace('{{userName}}', userName)
      .replace('{{ticketId}}', ticketId)
      .replace('{{ticketTitle}}', ticketTitle)
      .replace('{{comment}}', comment || '');

    return this.sendEmail({ email: to, subject: template.subject, html });
  }

  public async sendTicketResolvedNotification(
    to: string,
    userName: string,
    ticketId: string,
    ticketTitle: string,
    resolution?: string
  ) {
    const template = await this.getTemplate('TICKET_RESOLVED');
    const html = template.body
      .replace('{{userName}}', userName)
      .replace('{{ticketId}}', ticketId)
      .replace('{{ticketTitle}}', ticketTitle)
      .replace('{{resolution}}', resolution || '');

    return this.sendEmail({ email: to, subject: template.subject, html });
  }

  public async sendTicketClosedNotification(
    to: string,
    userName: string,
    ticketId: string,
    ticketTitle: string,
    closingNote?: string
  ) {
    const template = await this.getTemplate('TICKET_CLOSED');
    const html = template.body
      .replace('{{userName}}', userName)
      .replace('{{ticketId}}', ticketId)
      .replace('{{ticketTitle}}', ticketTitle)
      .replace('{{closingNote}}', closingNote || '');

    return this.sendEmail({ email: to, subject: template.subject, html });
  }

  public async sendTicketAssignedNotification(
    to: string,
    userName: string,
    ticketId: string,
    ticketTitle: string,
    creatorName: string
  ) {
    const template = await this.getTemplate('TICKET_ASSIGNED');
    const html = template.body
      .replace('{{userName}}', userName)
      .replace('{{ticketId}}', ticketId)
      .replace('{{ticketTitle}}', ticketTitle)
      .replace('{{creatorName}}', creatorName);

    return this.sendEmail({ email: to, subject: template.subject, html });
  }

  public async sendTicketAssignedToCreatorNotification(
    to: string,
    userName: string,
    ticketId: string,
    ticketTitle: string,
    assigneeName: string
  ) {
    const template = await this.getTemplate('TICKET_ASSIGNED');
    const html = template.body
      .replace('{{userName}}', userName)
      .replace('{{ticketId}}', ticketId)
      .replace('{{ticketTitle}}', ticketTitle)
      .replace('{{assigneeName}}', assigneeName);

    return this.sendEmail({ email: to, subject: template.subject, html });
  }

  public async sendWelcomeEmail(to: string, userName: string) {
    const template = await this.getTemplate('WELCOME_EMAIL');
    const html = template.body.replace('{{userName}}', userName);

    return this.sendEmail({ email: to, subject: template.subject, html });
  }

  public async sendSecurityAlert(to: string, userName: string, location: string, device: string) {
    const template = await this.getTemplate('SECURITY_ALERT');
    const html = template.body
      .replace('{{userName}}', userName)
      .replace('{{location}}', location)
      .replace('{{device}}', device);

    return this.sendEmail({ email: to, subject: template.subject, html });
  }

  public async sendSubscriptionRenewalReminder(
    email: string,
    name: string,
    planName: string,
    renewalDate: string
  ) {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.SUBSCRIPTION_RENEWAL.subject,
      html: EMAIL_TEMPLATES.SUBSCRIPTION_RENEWAL.html(name, planName, renewalDate)
    });
  }

  public async sendCreditUpdate(email: string, name: string, newBalance: number, reason: string) {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.CREDIT_UPDATE.subject,
      html: EMAIL_TEMPLATES.CREDIT_UPDATE.html(name, newBalance, reason)
    });
  }

  public async sendGDPRDataExportNotification(email: string, name: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.GDPR_DATA_EXPORT.subject,
      html: EMAIL_TEMPLATES.GDPR_DATA_EXPORT.html(name)
    });
  }

  public async sendGDPRAccountDeletionNotification(email: string, name: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.GDPR_ACCOUNT_DELETION.subject,
      html: EMAIL_TEMPLATES.GDPR_ACCOUNT_DELETION.html(name)
    });
  }

  public async sendGDPRConsentChangeNotification({ email, name, changes }: GDPRConsentChangeOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.GDPR_CONSENT_CHANGE.subject,
      html: EMAIL_TEMPLATES.GDPR_CONSENT_CHANGE.html(name, changes)
    });
  }

  public async sendGDPRDataRectificationNotification({ email, name, changes }: GDPRDataRectificationOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.GDPR_DATA_RECTIFICATION.subject,
      html: EMAIL_TEMPLATES.GDPR_DATA_RECTIFICATION.html(name, changes)
    });
  }

  public async sendPromptCreatedNotification({ email, name, promptTitle }: PromptNotificationOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.PROMPT_CREATED.subject,
      html: EMAIL_TEMPLATES.PROMPT_CREATED.html(name, promptTitle)
    });
  }

  public async sendPromptUpdatedNotification({ email, name, promptTitle }: PromptNotificationOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.PROMPT_UPDATED.subject,
      html: EMAIL_TEMPLATES.PROMPT_UPDATED.html(name, promptTitle)
    });
  }

  public async sendPromptDeletedNotification({ email, name, promptTitle }: PromptNotificationOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.PROMPT_DELETED.subject,
      html: EMAIL_TEMPLATES.PROMPT_DELETED.html(name, promptTitle)
    });
  }

  public async sendPromptSharedNotification({ email, name, promptTitle, sharedBy }: PromptNotificationOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.PROMPT_SHARED.subject,
      html: EMAIL_TEMPLATES.PROMPT_SHARED.html(name, promptTitle, sharedBy!)
    });
  }

  public async sendPromptCommentedNotification({ email, name, promptTitle, commenter, comment }: PromptNotificationOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.PROMPT_COMMENTED.subject,
      html: EMAIL_TEMPLATES.PROMPT_COMMENTED.html(name, promptTitle, commenter!, comment!)
    });
  }

  public async sendPromptVotedNotification({ email, name, promptTitle, voter, voteType }: PromptNotificationOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.PROMPT_VOTED.subject,
      html: EMAIL_TEMPLATES.PROMPT_VOTED.html(name, promptTitle, voter!, voteType!)
    });
  }

  public async sendAPIKeyCreatedNotification({ email, name, keyName }: APIKeyNotificationOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.API_KEY_CREATED.subject,
      html: EMAIL_TEMPLATES.API_KEY_CREATED.html(name, keyName)
    });
  }

  public async sendAPIKeyRevokedNotification({ email, name, keyName }: APIKeyNotificationOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.API_KEY_REVOKED.subject,
      html: EMAIL_TEMPLATES.API_KEY_REVOKED.html(name, keyName)
    });
  }

  public async sendProfileUpdatedNotification({ email, name, changes }: ProfileUpdateOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.PROFILE_UPDATED.subject,
      html: EMAIL_TEMPLATES.PROFILE_UPDATED.html(name, changes)
    });
  }

  public async sendPasswordChangedNotification({ email, name, location, device }: SecurityNotificationOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.PASSWORD_CHANGED.subject,
      html: EMAIL_TEMPLATES.PASSWORD_CHANGED.html(name, location, device)
    });
  }

  public async sendTwoFactorEnabledNotification({ email, name }: { email: string; name: string }): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.TWO_FACTOR_ENABLED.subject,
      html: EMAIL_TEMPLATES.TWO_FACTOR_ENABLED.html(name)
    });
  }

  public async sendTwoFactorDisabledNotification({ email, name }: { email: string; name: string }): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.TWO_FACTOR_DISABLED.subject,
      html: EMAIL_TEMPLATES.TWO_FACTOR_DISABLED.html(name)
    });
  }

  public async sendPlanChangedNotification({ email, name, oldPlan, newPlan }: PlanChangeOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.PLAN_CHANGED.subject,
      html: EMAIL_TEMPLATES.PLAN_CHANGED.html(name, oldPlan, newPlan)
    });
  }

  public async sendPaymentFailedNotification({ email, name, planName, error }: PaymentNotificationOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.PAYMENT_FAILED.subject,
      html: EMAIL_TEMPLATES.PAYMENT_FAILED.html(name, planName, error!)
    });
  }

  public async sendPaymentSucceededNotification({ email, name, planName, amount }: PaymentNotificationOptions): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail({
      email,
      subject: EMAIL_TEMPLATES.PAYMENT_SUCCEEDED.subject,
      html: EMAIL_TEMPLATES.PAYMENT_SUCCEEDED.html(name, planName, amount!)
    });
  }
}
