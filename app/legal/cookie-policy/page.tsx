export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
      <p className="text-gray-600 mb-8">Last updated: October 16, 2025</p>

      <div className="prose prose-blue max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
          <p>
            Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Necessary Cookies (Always Active)</h3>
          <p className="mb-4">These cookies are essential for the website to function and cannot be disabled.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Authentication:</strong> Keep you logged in (Clerk)</li>
            <li><strong>Security:</strong> Prevent CSRF attacks</li>
            <li><strong>Preferences:</strong> Remember your settings</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Analytics Cookies (Optional)</h3>
          <p className="mb-4">Help us understand how you use our service to improve it.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Usage tracking:</strong> Pages visited, features used</li>
            <li><strong>Performance:</strong> Load times, errors</li>
            <li><strong>Anonymous data:</strong> No personal identification</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Marketing Cookies (Disabled)</h3>
          <p>We do not currently use marketing or advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Cookies We Use</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border-b text-left">Cookie</th>
                  <th className="px-4 py-2 border-b text-left">Purpose</th>
                  <th className="px-4 py-2 border-b text-left">Duration</th>
                  <th className="px-4 py-2 border-b text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b"><code>__session</code></td>
                  <td className="px-4 py-2 border-b">Authentication (Clerk)</td>
                  <td className="px-4 py-2 border-b">Session</td>
                  <td className="px-4 py-2 border-b">Necessary</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b"><code>cookie-consent</code></td>
                  <td className="px-4 py-2 border-b">Remember your cookie preferences</td>
                  <td className="px-4 py-2 border-b">1 year</td>
                  <td className="px-4 py-2 border-b">Necessary</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b"><code>_vercel_jwt</code></td>
                  <td className="px-4 py-2 border-b">Security token</td>
                  <td className="px-4 py-2 border-b">Session</td>
                  <td className="px-4 py-2 border-b">Necessary</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
          <p className="mb-4">You can control cookies in several ways:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cookie Banner:</strong> Accept or reject optional cookies when you first visit</li>
            <li><strong>Settings:</strong> Change your preferences in your account settings</li>
            <li><strong>Browser:</strong> Block or delete cookies through your browser settings</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            Note: Blocking necessary cookies may prevent the website from functioning properly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
          <p className="mb-4">We use the following third-party services that may set cookies:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Clerk:</strong> Authentication and user management</li>
            <li><strong>Vercel:</strong> Hosting and performance</li>
            <li><strong>Stripe:</strong> Payment processing (only on checkout pages)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at:{' '}
            <a href="mailto:privacy@prompthive.co" className="text-blue-600 hover:underline">
              privacy@prompthive.co
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
