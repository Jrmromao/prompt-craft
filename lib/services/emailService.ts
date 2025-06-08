import { Resend } from 'resend';
import { Category, Priority, TicketStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const EMAIL_TEMPLATES = {
  WELCOME: {
    subject: 'Welcome to PromptCraft! 🎉',
    html: (name: string) => `
      <h1>Welcome to PromptCraft, ${name}!</h1>
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
    subject: 'Security Alert: New Login Detected',
    html: (name: string, location: string, device: string) => `
      <h1>Security Alert</h1>
      <p>Hello ${name},</p>
      <p>We detected a new login to your PromptCraft account from:</p>
      <ul>
        <li>Location: ${location}</li>
        <li>Device: ${device}</li>
      </ul>
      <p>If this was you, you can ignore this email. If not, please secure your account immediately.</p>
    `,
  },
  SUBSCRIPTION_RENEWAL: {
    subject: 'Your PromptCraft Subscription is Renewing Soon',
    html: (name: string, planName: string, renewalDate: string) => `
      <h1>Subscription Renewal Reminder</h1>
      <p>Hello ${name},</p>
      <p>Your ${planName} subscription will renew on ${renewalDate}.</p>
      <p>Make sure your payment method is up to date to avoid any interruption in service.</p>
    `,
  },
  CREDIT_UPDATE: {
    subject: 'Your PromptCraft Credits Have Been Updated',
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
} as const;

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

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'PromptCraft <support@promptcraft.ai>',
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Error sending email:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in sendEmail:', error);
      throw error;
    }
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

    return this.sendEmail(to, template.subject, html);
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

    return this.sendEmail(to, template.subject, html);
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

    return this.sendEmail(to, template.subject, html);
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

    return this.sendEmail(to, template.subject, html);
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

    return this.sendEmail(to, template.subject, html);
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

    return this.sendEmail(to, template.subject, html);
  }

  public async sendWelcomeEmail(to: string, userName: string) {
    const template = await this.getTemplate('WELCOME_EMAIL');
    const html = template.body.replace('{{userName}}', userName);

    return this.sendEmail(to, template.subject, html);
  }

  public async sendSecurityAlert(to: string, userName: string, location: string, device: string) {
    const template = await this.getTemplate('SECURITY_ALERT');
    const html = template.body
      .replace('{{userName}}', userName)
      .replace('{{location}}', location)
      .replace('{{device}}', device);

    return this.sendEmail(to, template.subject, html);
  }

  public async sendSubscriptionRenewalReminder(
    email: string,
    name: string,
    planName: string,
    renewalDate: string
  ) {
    return this.sendEmail(
      email,
      EMAIL_TEMPLATES.SUBSCRIPTION_RENEWAL.subject,
      EMAIL_TEMPLATES.SUBSCRIPTION_RENEWAL.html(name, planName, renewalDate)
    );
  }

  public async sendCreditUpdate(email: string, name: string, newBalance: number, reason: string) {
    return this.sendEmail(
      email,
      EMAIL_TEMPLATES.CREDIT_UPDATE.subject,
      EMAIL_TEMPLATES.CREDIT_UPDATE.html(name, newBalance, reason)
    );
  }
}
