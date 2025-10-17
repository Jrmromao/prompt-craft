export const breachNotificationTemplate = {
  subject: "Important Security Notice - Data Breach Notification",
  
  html: (data: {
    userName: string;
    breachDate: string;
    dataAffected: string[];
    actionsTaken: string[];
    userActions: string[];
  }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .section { margin: 20px 0; }
    .list { background: white; padding: 15px; border-left: 4px solid #dc2626; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .cta { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Security Incident Notification</h1>
    </div>
    
    <div class="content">
      <p>Dear ${data.userName},</p>
      
      <p>We are writing to inform you of a security incident that may have affected your personal data. We take the security of your information very seriously and want to provide you with full transparency about what happened.</p>
      
      <div class="section">
        <h2>What Happened</h2>
        <p>On ${data.breachDate}, we detected unauthorized access to our systems. We immediately took action to contain the incident and launched a full investigation.</p>
      </div>
      
      <div class="section">
        <h2>What Information Was Affected</h2>
        <div class="list">
          <ul>
            ${data.dataAffected.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
      
      <div class="section">
        <h2>What We're Doing</h2>
        <div class="list">
          <ul>
            ${data.actionsTaken.map(action => `<li>${action}</li>`).join('')}
          </ul>
        </div>
      </div>
      
      <div class="section">
        <h2>What You Should Do</h2>
        <div class="list">
          <ul>
            ${data.userActions.map(action => `<li>${action}</li>`).join('')}
          </ul>
        </div>
      </div>
      
      <div class="section">
        <a href="https://costlens.dev/security/incident" class="cta">View Full Security Update</a>
      </div>
      
      <p>If you have any questions or concerns, please contact our security team at <strong>security@costlens.dev</strong> or our Data Protection Officer at <strong>dpo@costlens.dev</strong>.</p>
      
      <p>We sincerely apologize for this incident and any inconvenience it may cause. Your trust is important to us, and we are committed to protecting your data.</p>
      
      <p>Sincerely,<br>The CostLens Security Team</p>
    </div>
    
    <div class="footer">
      <p>This is a mandatory security notification required by GDPR Article 34.</p>
      <p>CostLens | security@costlens.dev | <a href="https://costlens.dev/privacy">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
  `,
  
  text: (data: {
    userName: string;
    breachDate: string;
    dataAffected: string[];
    actionsTaken: string[];
    userActions: string[];
  }) => `
IMPORTANT SECURITY NOTICE - DATA BREACH NOTIFICATION

Dear ${data.userName},

We are writing to inform you of a security incident that may have affected your personal data.

WHAT HAPPENED:
On ${data.breachDate}, we detected unauthorized access to our systems.

WHAT INFORMATION WAS AFFECTED:
${data.dataAffected.map(item => `- ${item}`).join('\n')}

WHAT WE'RE DOING:
${data.actionsTaken.map(action => `- ${action}`).join('\n')}

WHAT YOU SHOULD DO:
${data.userActions.map(action => `- ${action}`).join('\n')}

For more information, visit: https://costlens.dev/security/incident

Contact us:
- Security Team: security@costlens.dev
- Data Protection Officer: dpo@costlens.dev

We sincerely apologize for this incident.

The CostLens Security Team
  `
};
