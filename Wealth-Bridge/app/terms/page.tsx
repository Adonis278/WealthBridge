import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="frosted-glass rounded-2xl p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-secondary font-serif mb-3">Terms & Conditions</h1>
          <p className="text-sm text-darkwood mb-8">Last updated: February 24, 2026</p>

          <div className="space-y-6 text-darkwood leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-secondary font-serif mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using WealthBridge, you agree to these Terms & Conditions. If you do not agree, do not use
                the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary font-serif mb-2">2. Service Scope</h2>
              <p>
                WealthBridge provides educational credit-building tools, report upload workflows, and AI-assisted financial
                guidance. The service is informational and does not guarantee any specific credit outcome.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary font-serif mb-2">3. User Eligibility & Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate information when creating or using your account.</li>
                <li>You may upload only reports and documents you are legally authorized to share.</li>
                <li>You are responsible for actions taken based on platform insights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary font-serif mb-2">4. Credit Report Data Handling</h2>
              <p>
                Uploaded credit report content may include sensitive personal and financial data. By uploading, you authorize
                WealthBridge to process this content for analysis and recommendations. We use reasonable technical and
                administrative safeguards, but no transmission or storage system is absolutely secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary font-serif mb-2">5. AI-Generated Recommendations</h2>
              <p>
                AI outputs are generated from report text and user-provided profile responses. AI recommendations may be
                incomplete, inaccurate, or unsuitable for your situation and should be reviewed carefully before use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary font-serif mb-2">6. No Financial, Legal, or Credit Repair Advice</h2>
              <p>
                WealthBridge is not a law firm, lender, credit bureau, or credit repair organization. Nothing on the
                platform constitutes legal advice, tax advice, investment advice, or guaranteed credit repair services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary font-serif mb-2">7. Third-Party Services and Links</h2>
              <p>
                The platform may link to third-party services (including free credit report providers). WealthBridge does not
                control third-party websites and is not responsible for their content, policies, or availability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary font-serif mb-2">8. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, WealthBridge and RMA are not liable for indirect, incidental,
                consequential, special, or punitive damages arising from your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary font-serif mb-2">9. Termination</h2>
              <p>
                We may suspend or terminate access to the platform for misuse, violation of these terms, or security reasons.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary font-serif mb-2">10. Changes to Terms</h2>
              <p>
                We may update these Terms & Conditions from time to time. Continued use after updates means you accept the
                revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary font-serif mb-2">11. Contact</h2>
              <p>
                For questions about these terms, contact the WealthBridge support team through your organization’s
                designated channel.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
