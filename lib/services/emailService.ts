import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  static async sendEmail({ to, subject, html }: EmailOptions) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('[EmailService] RESEND_API_KEY not configured');
        return { success: false, error: 'Email not configured' };
      }

      const { data, error } = await resend.emails.send({
        from: 'PromptCraft <alerts@promptcraft.app>',
        to,
        subject,
        html,
      });

      if (error) {
        console.error('[EmailService] Send failed:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('[EmailService] Error:', error);
      return { success: false, error };
    }
  }

  static async sendInvalidApiKeyAlert(userEmail: string, apiKeyName: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Invalid API Key Detected</h2>
        <p>We detected that your API key "<strong>${apiKeyName}</strong>" is invalid or has expired.</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>What this means:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Your application continues to work normally</li>
            <li>Usage tracking is disabled</li>
            <li>Cost optimization features are disabled</li>
            <li>Analytics are not being collected</li>
          </ul>
        </div>

        <h3>Action Required:</h3>
        <ol>
          <li>Log in to your <a href="https://promptcraft.app/settings">PromptCraft dashboard</a></li>
          <li>Generate a new API key</li>
          <li>Update your application with the new key</li>
        </ol>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If you didn't expect this email, please contact support.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '⚠️ PromptCraft: Invalid API Key Detected',
      html,
    });
  }

  static async sendCostSpikeAlert(userEmail: string, currentCost: number, threshold: number) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">💰 Cost Spike Alert</h2>
        <p>Your daily AI costs have exceeded your alert threshold.</p>
        
        <div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Current Cost:</strong> $${currentCost.toFixed(2)}</p>
          <p style="margin: 10px 0 0 0;"><strong>Your Threshold:</strong> $${threshold.toFixed(2)}</p>
        </div>

        <h3>Recommended Actions:</h3>
        <ul>
          <li>Review your <a href="https://promptcraft.app/analytics">usage analytics</a></li>
          <li>Check for unexpected API calls</li>
          <li>Enable smart routing to reduce costs</li>
          <li>Optimize your prompts</li>
        </ul>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          You can adjust your alert threshold in <a href="https://promptcraft.app/settings/alerts">settings</a>.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '💰 PromptCraft: Cost Spike Alert',
      html,
    });
  }

  static async sendErrorRateAlert(userEmail: string, errorRate: number, threshold: number) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🚨 High Error Rate Detected</h2>
        <p>Your AI API error rate has exceeded your alert threshold.</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Current Error Rate:</strong> ${errorRate.toFixed(1)}%</p>
          <p style="margin: 10px 0 0 0;"><strong>Your Threshold:</strong> ${threshold}%</p>
        </div>

        <h3>Possible Causes:</h3>
        <ul>
          <li>Invalid API keys for AI providers</li>
          <li>Rate limits exceeded</li>
          <li>Network connectivity issues</li>
          <li>Invalid model names or parameters</li>
        </ul>

        <p>
          <a href="https://promptcraft.app/analytics" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Error Details
          </a>
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: '🚨 PromptCraft: High Error Rate Alert',
      html,
    });
  }
}
