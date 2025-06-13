'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TableOfContents } from '../../../components/TableOfContents';

interface PrivacyContentProps {
  user: {
    name: string;
    email: string;
    imageUrl?: string;
  } | null;
}

export function PrivacyContent({ user }: PrivacyContentProps) {
  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'legal-disclaimer', title: 'Legal Disclaimer' },
    { id: 'gdpr-compliance', title: 'GDPR Compliance' },
    { id: 'information-collection', title: 'Information Collection' },
    { id: 'information-use', title: 'Information Use' },
    { id: 'information-sharing', title: 'Information Sharing' },
    { id: 'data-security', title: 'Data Security' },
    { id: 'cookies', title: 'Cookies and Tracking' },
    { id: 'user-rights', title: 'Your Rights' },
    { id: 'medical-disclaimer', title: 'Medical Information Disclaimer' },
    { id: 'children', title: 'Children\'s Privacy' },
    { id: 'international', title: 'International Data Transfers' },
    { id: 'changes', title: 'Changes to Policy' },
    { id: 'contact', title: 'Contact Us' },
    { id: 'data-retention', title: 'Data Retention and Processing' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white">
      <main className="mx-auto max-w-7xl px-4 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Table of Contents */}
          <div className="hidden lg:block lg:w-64">
            <div className="sticky top-8">
              <TableOfContents sections={sections} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
            <div className="prose prose-sm md:prose-base prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-foreground max-w-none">
              <p className="lead">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section id="introduction">
                <h2>1. Introduction</h2>
                <p>
                  Welcome to <strong>prompthive.co</strong>'s Privacy Policy. This document explains how we collect, use, 
                  disclose, and safeguard your information when you use our service. We respect your privacy and are 
                  committed to protecting your personal data.
                </p>
              </section>

              <section id="legal-disclaimer">
                <h2>2. Legal Disclaimer</h2>
                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Important Legal Notice</h3>
                  <p className="mt-2 text-red-700 dark:text-red-300">
                    By using prompthive.co, you acknowledge and agree to the following terms:
                  </p>
                </div>

                <h3>2.1 No Legal Advice</h3>
                <p>
                  prompthive.co is not a law firm and does not provide legal advice. Any content generated 
                  through our service:
                </p>
                <ul>
                  <li>Should not be considered legal advice</li>
                  <li>May not be accurate or up-to-date</li>
                  <li>Should be verified by qualified legal professionals</li>
                  <li>Is not a substitute for professional legal counsel</li>
                </ul>

                <h3>2.2 Limitation of Liability</h3>
                <p>
                  To the maximum extent permitted by law:
                </p>
                <ul>
                  <li>We are not liable for any direct, indirect, incidental, or consequential damages</li>
                  <li>We do not guarantee the accuracy, completeness, or reliability of generated content</li>
                  <li>We are not responsible for any decisions made based on our service</li>
                  <li>Our total liability shall not exceed the amount paid by you in the past 12 months</li>
                </ul>

                <h3>2.3 Indemnification</h3>
                <p>
                  You agree to indemnify and hold harmless prompthive.co, its officers, directors, employees, 
                  and agents from any claims, damages, losses, liabilities, costs, and expenses (including 
                  legal fees) arising from:
                </p>
                <ul>
                  <li>Your use of the service</li>
                  <li>Your violation of these terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Any content you generate or share</li>
                </ul>

                <h3>2.4 No Warranties</h3>
                <p>
                  The service is provided "as is" without any warranties, express or implied, including:
                </p>
                <ul>
                  <li>Warranties of merchantability</li>
                  <li>Fitness for a particular purpose</li>
                  <li>Non-infringement</li>
                  <li>Accuracy or reliability</li>
                </ul>

                <h3>2.5 Force Majeure</h3>
                <p>
                  We are not liable for any failure or delay in performance due to circumstances beyond our 
                  reasonable control, including:
                </p>
                <ul>
                  <li>Natural disasters</li>
                  <li>War or terrorism</li>
                  <li>Technical failures</li>
                  <li>Government actions</li>
                </ul>

                <h3>2.6 Governing Law</h3>
                <p>
                  These terms are governed by the laws of [Your Jurisdiction]. Any disputes shall be resolved 
                  in the courts of [Your Jurisdiction]. You agree to submit to the personal jurisdiction of 
                  these courts.
                </p>

                <h3>2.7 Class Action Waiver</h3>
                <p>
                  You agree that any claims relating to these terms or the service will be brought individually, 
                  not as part of any class action or consolidated proceeding.
                </p>

                <h3>2.8 Severability</h3>
                <p>
                  If any provision of these terms is found to be unenforceable, the remaining provisions will 
                  remain in full force and effect.
                </p>

                <h3>2.9 Arbitration Agreement</h3>
                <p>
                  Any dispute, controversy, or claim arising out of or relating to these terms shall be resolved 
                  exclusively through binding arbitration in accordance with the rules of the American Arbitration 
                  Association. The arbitration shall take place in [Your Jurisdiction]. The decision of the arbitrator 
                  shall be final and binding.
                </p>

                <h3>2.10 AI-Specific Disclaimers</h3>
                <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                  <p className="text-amber-700 dark:text-amber-300">
                    Our service uses artificial intelligence and machine learning technologies. You acknowledge that:
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-amber-700 dark:text-amber-300">
                    <li>AI-generated content may not be accurate, complete, or suitable for all purposes</li>
                    <li>Content may reflect biases present in training data</li>
                    <li>Results may vary and are not guaranteed to be consistent</li>
                    <li>You are responsible for verifying and validating all AI-generated content</li>
                  </ul>
                </div>

                <h3>2.11 Content Restrictions and Prohibited Uses</h3>
                <p>
                  You agree not to use our service to generate content that:
                </p>
                <ul>
                  <li>Violates any applicable laws or regulations</li>
                  <li>Infringes intellectual property rights</li>
                  <li>Contains hate speech or discriminatory content</li>
                  <li>Promotes illegal activities</li>
                  <li>Contains explicit or adult content</li>
                  <li>Attempts to impersonate others</li>
                  <li>Contains malware or harmful code</li>
                  <li>Attempts to reverse engineer our AI models</li>
                </ul>

                <h3>2.12 Intellectual Property Rights</h3>
                <p>
                  Regarding AI-generated content:
                </p>
                <ul>
                  <li>You retain rights to your input prompts</li>
                  <li>We retain rights to our AI models and technology</li>
                  <li>You are responsible for ensuring you have rights to use generated content</li>
                  <li>We do not claim ownership of your generated content</li>
                  <li>You must respect third-party intellectual property rights</li>
                </ul>

                <h3>2.13 Service Modifications and Termination</h3>
                <p>
                  We reserve the right to:
                </p>
                <ul>
                  <li>Modify or discontinue any part of the service without notice</li>
                  <li>Terminate or suspend access for violations of these terms</li>
                  <li>Update or change our AI models and algorithms</li>
                  <li>Implement usage limits or restrictions</li>
                </ul>

                <h3>2.14 Age and Geographic Restrictions</h3>
                <p>
                  You must:
                </p>
                <ul>
                  <li>Be at least 18 years old to use the service</li>
                  <li>Comply with all applicable export control laws</li>
                  <li>Not use the service in jurisdictions where it is prohibited</li>
                  <li>Not use the service to violate any local laws</li>
                </ul>

                <h3>2.15 Data Processing and Storage</h3>
                <p>
                  You acknowledge that:
                </p>
                <ul>
                  <li>Data may be processed in various jurisdictions</li>
                  <li>We may use your data to improve our AI models</li>
                  <li>We implement reasonable security measures</li>
                  <li>No system is completely secure</li>
                </ul>

                <h3>2.16 Third-Party Services</h3>
                <p>
                  Our service may integrate with or link to third-party services. We:
                </p>
                <ul>
                  <li>Are not responsible for third-party content or services</li>
                  <li>Do not endorse third-party services</li>
                  <li>Are not liable for third-party actions or content</li>
                  <li>Recommend reviewing third-party terms and policies</li>
                </ul>

                <h3>2.17 Updates to Terms</h3>
                <p>
                  We may update these terms at any time. Continued use of the service after changes constitutes 
                  acceptance of the new terms. We will notify you of material changes via email or through the 
                  service.
                </p>

                <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    By using prompthive.co, you explicitly acknowledge that you have read, understood, and agree 
                    to all terms and conditions, including these additional protections. If you do not agree with 
                    any part of these terms, you must immediately cease using our service.
                  </p>
                </div>
              </section>

              <section id="gdpr-compliance">
                <h2>3. GDPR Compliance</h2>
                <p>
                  prompthive.co is committed to complying with the General Data Protection Regulation (GDPR) 
                  and other applicable data protection laws. This section outlines our specific GDPR compliance measures.
                </p>

                <h3>3.1 Legal Basis for Processing</h3>
                <p>We process your personal data on the following legal bases:</p>
                <ul>
                  <li>Contract: To provide our services and fulfill our obligations to you</li>
                  <li>Consent: When you explicitly agree to specific data processing activities</li>
                  <li>Legitimate Interest: For improving our services and preventing fraud</li>
                  <li>Legal Obligation: To comply with applicable laws and regulations</li>
                </ul>

                <h3>3.2 Data Protection Officer</h3>
                <p>
                  We have appointed a Data Protection Officer (DPO) who can be contacted at{' '}
                  <a
                    href="mailto:dpo@prompthive.co"
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    dpo@prompthive.co
                  </a>
                  .
                </p>

                <h3>3.3 Data Retention</h3>
                <p>
                  We retain your personal data only for as long as necessary to fulfill the purposes 
                  for which it was collected, including legal, accounting, or reporting requirements. 
                  When we no longer need your data, we will securely delete or anonymize it.
                </p>
              </section>

              <section id="information-collection">
                <h2>4. Information Collection</h2>
                <h3>4.1 Personal Information</h3>
                <ul>
                  <li>Account information (name, email, profile picture)</li>
                  <li>Authentication data</li>
                  <li>Contact information</li>
                  <li>Billing and payment details</li>
                </ul>

                <h3>4.2 Usage Information</h3>
                <ul>
                  <li>Log data and device information</li>
                  <li>Usage patterns and preferences</li>
                  <li>Content you create and interact with</li>
                  <li>Analytics and performance data</li>
                </ul>
              </section>

              <section id="information-use">
                <h2>5. Information Use</h2>
                <ul>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and manage accounts</li>
                  <li>Send important updates and notifications</li>
                  <li>Prevent fraud and enhance security</li>
                  <li>Analyze usage patterns to improve user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section id="information-sharing">
                <h2>6. Information Sharing</h2>
                <p>We may share your information with:</p>
                <ul>
                  <li>Service providers and business partners</li>
                  <li>Legal authorities when required by law</li>
                  <li>Third parties with your explicit consent</li>
                </ul>
                <p>
                  We do not sell your personal information to third parties.
                </p>
              </section>

              <section id="data-security">
                <h2>7. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your data, including:
                </p>
                <ul>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication</li>
                  <li>Secure data storage and backup systems</li>
                </ul>
              </section>

              <section id="cookies">
                <h2>7. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to:
                </p>
                <ul>
                  <li>Remember your preferences</li>
                  <li>Analyze site usage</li>
                  <li>Enhance security</li>
                  <li>Improve user experience</li>
                </ul>
                <p>
                  You can control cookie preferences through your browser settings.
                </p>
              </section>

              <section id="user-rights">
                <h2>8. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request data deletion</li>
                  <li>Object to data processing</li>
                  <li>Data portability</li>
                  <li>Withdraw consent</li>
                </ul>
              </section>

              <section id="medical-disclaimer">
                <h2>9. Medical Information Disclaimer</h2>
                <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Important Notice</h3>
                  <p className="mt-2 text-amber-700 dark:text-amber-300">
                    prompthive.co is not a medical service provider and does not provide medical advice, 
                    diagnosis, or treatment. Any prompts or content related to medical information should 
                    be used with extreme caution and under the following conditions:
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-amber-700 dark:text-amber-300">
                    <li>All medical-related prompts are for informational purposes only</li>
                    <li>Do not rely on AI-generated medical information for diagnosis or treatment</li>
                    <li>Always consult qualified healthcare professionals for medical advice</li>
                    <li>Medical prompts should not be used in emergency situations</li>
                    <li>We do not guarantee the accuracy of medical information generated</li>
                  </ul>
                </div>

                <h3>9.1 Medical Data Processing</h3>
                <p>
                  If you choose to use our service for medical-related prompts:
                </p>
                <ul>
                  <li>We do not store or process sensitive medical information</li>
                  <li>Any medical-related content is treated as general information</li>
                  <li>We do not provide medical advice or diagnosis</li>
                  <li>We are not responsible for any decisions made based on generated content</li>
                </ul>

                <h3>9.2 Healthcare Provider Use</h3>
                <p>
                  Healthcare providers using our service:
                </p>
                <ul>
                  <li>Must comply with all applicable healthcare regulations</li>
                  <li>Should not input patient-specific information</li>
                  <li>Are responsible for verifying all generated content</li>
                  <li>Must maintain appropriate professional standards</li>
                </ul>
              </section>

              <section id="children">
                <h2>10. Children's Privacy</h2>
                <p>
                  Our service is not intended for children under 13. We do not knowingly collect personal 
                  information from children under 13. If you believe we have collected information from a 
                  child under 13, please contact us.
                </p>
              </section>

              <section id="international">
                <h2>11. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place for such transfers in compliance with 
                  applicable data protection laws.
                </p>
              </section>

              <section id="changes">
                <h2>12. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy periodically. We will notify you of any material 
                  changes through our website or via email. Your continued use of prompthive.co after 
                  such changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section id="contact">
                <h2>13. Contact Us</h2>
                <p>
                  For questions about this Privacy Policy or your data rights, please contact us at{' '}
                  <a
                    href="mailto:privacy@prompthive.co"
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    privacy@prompthive.co
                  </a>
                  .
                </p>
              </section>

              <section id="data-retention">
                <h2>3. Data Retention and Processing</h2>
                
                <h3>3.1 Data Retention Periods</h3>
                <p>We retain your personal data for specific periods based on the type of data and its purpose:</p>
                <ul>
                  <li><strong>Account Data:</strong> Retained for the duration of your account's existence. Upon account deletion, data is permanently removed within 30 days.</li>
                  <li><strong>Usage Data:</strong> Retained for 12 months from the date of collection.</li>
                  <li><strong>Analytics Data:</strong> Retained for 13 months from the date of collection.</li>
                  <li><strong>Marketing Preferences:</strong> Retained until you opt-out or request deletion.</li>
                  <li><strong>Support Communications:</strong> Retained for 24 months from the last interaction.</li>
                </ul>

                <h3>3.2 Data Processing Procedures</h3>
                <p>We process your data in accordance with the following procedures:</p>
                <ul>
                  <li><strong>Data Collection:</strong> We collect data directly from you when you create an account, use our services, or interact with our platform.</li>
                  <li><strong>Data Storage:</strong> All data is stored in secure, encrypted databases with access controls and regular security audits.</li>
                  <li><strong>Data Processing:</strong> Your data is processed for the following purposes:
                    <ul>
                      <li>Providing and maintaining our services</li>
                      <li>Improving user experience</li>
                      <li>Ensuring platform security</li>
                      <li>Complying with legal obligations</li>
                    </ul>
                  </li>
                  <li><strong>Data Sharing:</strong> We only share your data with:
                    <ul>
                      <li>Service providers who assist in operating our platform</li>
                      <li>Legal authorities when required by law</li>
                      <li>Third parties with your explicit consent</li>
                    </ul>
                  </li>
                </ul>

                <h3>3.3 Data Deletion Process</h3>
                <p>When you request data deletion:</p>
                <ul>
                  <li>Your account and associated data are marked for deletion</li>
                  <li>Data is permanently removed within 30 days</li>
                  <li>Backup copies are deleted within 90 days</li>
                  <li>You receive confirmation of deletion completion</li>
                </ul>

                <h3>3.4 Data Security Measures</h3>
                <p>We implement the following security measures to protect your data:</p>
                <ul>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Regular backup procedures</li>
                  <li>Incident response and breach notification procedures</li>
                </ul>
              </section>

              <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  By using prompthive.co, you acknowledge that you have read and understood this Privacy Policy, 
                  including the GDPR compliance measures and medical information disclaimer. You agree to use 
                  our service in accordance with these terms and applicable laws.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
