export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="text-gray-600 mb-8">Last updated: October 18, 2025</p>

      <div className="prose prose-blue max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using CostLens ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
            If you disagree with any part of these terms, you may not access the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
          <p>
            CostLens provides AI cost optimization and analytics services, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Smart routing to optimize AI model selection</li>
            <li>Cost tracking and analytics</li>
            <li>Prompt optimization</li>
            <li>Caching and performance optimization</li>
            <li>Usage monitoring and alerts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">Account Creation</h3>
          <p>
            You must provide accurate, complete, and current information during registration. 
            You are responsible for maintaining the confidentiality of your account credentials.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Account Security</h3>
          <p>
            You are responsible for all activities that occur under your account. 
            Notify us immediately of any unauthorized access or security breach.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Subscription Plans</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">Plan Tiers</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Free:</strong> $0/month with basic features</li>
            <li><strong>Starter:</strong> $9/month with enhanced features</li>
            <li><strong>Pro:</strong> $29/month with advanced features</li>
            <li><strong>Enterprise:</strong> Custom pricing with full features</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Billing</h3>
          <p>
            Subscriptions are billed monthly or annually in advance. All fees are non-refundable except as required by law or as explicitly stated in our refund policy.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Cancellation</h3>
          <p>
            You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. 
            No refunds will be provided for partial months.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Share your account credentials with others</li>
            <li>Reverse engineer or attempt to extract source code</li>
            <li>Use the Service to compete with CostLens</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. API Keys and Third-Party Services</h2>
          <p>
            You are responsible for your own API keys for third-party services (OpenAI, Anthropic, etc.). 
            CostLens is not responsible for charges incurred through your API keys or any issues with third-party services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. Data and Privacy</h2>
          <p>
            Your use of the Service is also governed by our Privacy Policy. We collect and process data as described in our Privacy Policy.
          </p>
          <p className="mt-4">
            <strong>Data Retention:</strong> We retain your data according to your plan tier (7-365 days). 
            You can request data deletion at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by CostLens and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
          <p className="mt-4">
            You retain all rights to your data and prompts. By using the Service, you grant us a limited license to process your data to provide the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p className="mt-4">
            We do not guarantee:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Uninterrupted or error-free service</li>
            <li>Specific cost savings amounts</li>
            <li>Accuracy of analytics or predictions</li>
            <li>Compatibility with all third-party services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, COSTLENS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </p>
          <p className="mt-4">
            Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless CostLens from any claims, damages, losses, liabilities, and expenses arising from your use of the Service or violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">12. Modifications to Service</h2>
          <p>
            We reserve the right to modify or discontinue the Service at any time, with or without notice. 
            We will not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of any changes by posting the new Terms on this page and updating the "Last updated" date.
          </p>
          <p className="mt-4">
            Your continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">14. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms.
          </p>
          <p className="mt-4">
            Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">15. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which CostLens operates, without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">16. Dispute Resolution</h2>
          <p>
            Any disputes arising from these Terms or the Service shall be resolved through binding arbitration, except where prohibited by law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">17. Contact Information</h2>
          <p>
            For questions about these Terms, please contact us at:
          </p>
          <p className="mt-4">
            <strong>Email:</strong> <a href="mailto:legal@costlens.dev" className="text-blue-600 hover:underline">legal@costlens.dev</a><br />
            <strong>Website:</strong> <a href="https://costlens.dev" className="text-blue-600 hover:underline">costlens.dev</a>
          </p>
        </section>

        <section className="border-t pt-8 mt-8">
          <p className="text-sm text-gray-600">
            By using CostLens, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </section>
      </div>
    </div>
  );
}