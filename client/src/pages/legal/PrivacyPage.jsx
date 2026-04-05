// Privacy Policy page

import { LegalLayout } from './LegalLayout';
import { usePageTitle } from '../../hooks/usePageTitle';

export function PrivacyPage() {
  usePageTitle('Privacy Policy');
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="We take your privacy seriously. Here's exactly what data we collect and why."
      lastUpdated="March 1, 2026"
    >
      <h2>1. Information We Collect</h2>
      <p>
        We collect information you provide directly, such as your name, email address, mobile number, and payment details when you register for or use ExpertsHub. We also collect information about how you use our platform, including bookings made, services browsed, and communications with professionals.
      </p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To match customers with the right professionals for each service request</li>
        <li>To process bookings, payments, and refunds securely</li>
        <li>To verify professional identities and maintain platform safety</li>
        <li>To send booking confirmations, updates, and support responses</li>
        <li>To improve our platform based on usage patterns and feedback</li>
      </ul>

      <h2>3. Data Sharing</h2>
      <p>
        We do not sell your personal data to third parties. We share information only with professionals who are assigned your booking, payment processors (in encrypted form), and regulators when legally required.
      </p>

      <h2>4. Data Security</h2>
      <p>
        We apply industry-standard encryption (TLS/SSL) for data in transit and at rest. Access to personal data is restricted to authorised personnel only. We conduct regular security audits.
      </p>

      <h2>5. Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data at any time by contacting us at <strong>privacy@expertshub.tech</strong>. We will respond within 30 days.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use essential cookies to keep you logged in and functional cookies to improve your experience. See our <a href="/cookies" className="text-brand-500 hover:text-brand-600">Cookie Policy</a> for details.
      </p>

      <h2>7. Contact Us</h2>
      <p>
        Questions about this policy? Email us at <strong>privacy@expertshub.tech</strong> or write to our registered office.
      </p>
    </LegalLayout>
  );
}
