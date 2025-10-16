export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-gray-600 mb-8">Last updated: October 16, 2025</p>

      <div className="prose prose-blue max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Data Controller</h2>
          <p>
            <strong>PromptCraft</strong><br />
            Email: <a href="mailto:privacy@prompthive.co" className="text-blue-600">privacy@prompthive.co</a><br />
            Website: <a href="https://prompthive.co" className="text-blue-600">prompthive.co</a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Data We Collect</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Account Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Email address:</strong> For authentication and communication</li>
            <li><strong>Name:</strong> For personalization</li>
            <li><strong>Password:</strong> Hashed and encrypted (via Clerk)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Usage Data</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>API requests:</strong> Model, tokens, cost, latency</li>
            <li><strong>API keys:</strong> Hashed with bcrypt (never stored in plain text)</li>
            <li><strong>Quality feedback:</strong> Ratings and comments</li>
            <li><strong>Audit logs:</strong> Account actions for security</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Billing Data</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Payment information:</strong> Processed by Stripe (we never see card numbers)</li>
            <li><strong>Billing history:</strong> Invoices and receipts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Service delivery:</strong> Provide cost tracking and optimization</li>
            <li><strong>Billing:</strong> Process payments and send invoices</li>
            <li><strong>Support:</strong> Respond to your questions</li>
            <li><strong>Improvements:</strong> Analyze usage to improve features</li>
            <li><strong>Security:</strong> Detect and prevent fraud</li>
            <li><strong>Legal compliance:</strong> Meet regulatory requirements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Data Retention</h2>
          <table className="min-w-full border border-gray-200 mt-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border-b text-left">Data Type</th>
                <th className="px-4 py-2 border-b text-left">Retention Period</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border-b">Account data</td>
                <td className="px-4 py-2 border-b">Until deletion request</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">Usage logs</td>
                <td className="px-4 py-2 border-b">90 days</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">Audit logs</td>
                <td className="px-4 py-2 border-b">1 year</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">Billing records</td>
                <td className="px-4 py-2 border-b">7 years (legal requirement)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">Cache data</td>
                <td className="px-4 py-2 border-b">1 hour</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">Deleted accounts</td>
                <td className="px-4 py-2 border-b">30 days (soft delete), then permanent</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Third-Party Processors</h2>
          <p className="mb-4">We use the following trusted service providers:</p>
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border-b text-left">Service</th>
                <th className="px-4 py-2 border-b text-left">Purpose</th>
                <th className="px-4 py-2 border-b text-left">Location</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border-b">Clerk</td>
                <td className="px-4 py-2 border-b">Authentication</td>
                <td className="px-4 py-2 border-b">US (DPF certified)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">Vercel</td>
                <td className="px-4 py-2 border-b">Hosting</td>
                <td className="px-4 py-2 border-b">US/EU</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">Stripe</td>
                <td className="px-4 py-2 border-b">Payments</td>
                <td className="px-4 py-2 border-b">US (DPF certified)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">Upstash</td>
                <td className="px-4 py-2 border-b">Caching</td>
                <td className="px-4 py-2 border-b">EU</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">Resend</td>
                <td className="px-4 py-2 border-b">Email delivery</td>
                <td className="px-4 py-2 border-b">US</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">OpenAI</td>
                <td className="px-4 py-2 border-b">Prompt optimization</td>
                <td className="px-4 py-2 border-b">US</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-sm text-gray-600">
            All processors have Data Processing Agreements (DPAs) in place and comply with GDPR.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. International Data Transfers</h2>
          <p className="mb-4">
            Your data may be transferred to and processed in the United States and other countries. We ensure adequate protection through:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Data Privacy Framework (DPF):</strong> For US transfers</li>
            <li><strong>Standard Contractual Clauses (SCCs):</strong> EU-approved contracts</li>
            <li><strong>Adequacy decisions:</strong> Where available</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. Your Rights (GDPR)</h2>
          <p className="mb-4">You have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Right to access:</strong> Request a copy of your data</li>
            <li><strong>Right to rectification:</strong> Correct inaccurate data</li>
            <li><strong>Right to erasure:</strong> Delete your account and data</li>
            <li><strong>Right to portability:</strong> Export your data in JSON format</li>
            <li><strong>Right to object:</strong> Object to certain processing</li>
            <li><strong>Right to restrict:</strong> Limit how we use your data</li>
            <li><strong>Right to withdraw consent:</strong> At any time</li>
          </ul>
          <p className="mt-4">
            To exercise your rights, visit your <a href="/settings" className="text-blue-600 hover:underline">account settings</a> or email{' '}
            <a href="mailto:privacy@prompthive.co" className="text-blue-600">privacy@prompthive.co</a>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            We will respond within 30 days. You also have the right to lodge a complaint with your local supervisory authority.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. Security</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Encryption:</strong> HTTPS for all connections, encrypted database</li>
            <li><strong>Hashing:</strong> API keys hashed with bcrypt (10 rounds)</li>
            <li><strong>Access control:</strong> Role-based permissions</li>
            <li><strong>Monitoring:</strong> 24/7 security monitoring</li>
            <li><strong>Auditing:</strong> All actions logged</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. Data Breach Notification</h2>
          <p>
            In the event of a data breach affecting your personal data, we will notify you and the relevant supervisory authority within 72 hours, as required by GDPR Article 33.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
          <p>
            Our service is not intended for users under 16 years old (EU) or 13 years old (US). We do not knowingly collect data from children.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
          <p>
            For privacy questions or to exercise your rights:<br />
            Email: <a href="mailto:privacy@prompthive.co" className="text-blue-600">privacy@prompthive.co</a><br />
            Response time: Within 30 days
          </p>
        </section>

        <section className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">EU Representative</h3>
          <p className="text-sm">
            If you are in the European Union and have concerns about our data practices, you may contact your local supervisory authority.
          </p>
        </section>
      </div>
    </div>
  );
}
