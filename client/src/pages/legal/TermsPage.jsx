// Terms of Service page

import { LegalLayout } from './LegalLayout';
import { usePageTitle } from '../../hooks/usePageTitle';

export function TermsPage() {
  usePageTitle('Terms of Service');
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="By using ExpertsHub, you agree to these terms for a safe and respectful experience."
      lastUpdated="March 1, 2026"
    >
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using ExpertsHub, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part, you may not use our services.
      </p>

      <h2>2. User Responsibilities</h2>
      <ul>
        <li>Provide accurate and up-to-date information during registration</li>
        <li>Keep your credentials confidential and do not share your account</li>
        <li>Communicate respectfully with professionals and other users</li>
        <li>Pay for services in accordance with the agreed pricing</li>
        <li>Use the platform only for lawful purposes</li>
      </ul>

      <h2>3. Booking Policies</h2>
      <p>
        Cancellations and rescheduling must follow the service policy associated with each booking. Repeated last-minute cancellations may result in account restrictions. No-shows by professionals are covered by our guarantee policy.
      </p>

      <h2>4. Payment Terms</h2>
      <p>
        Payments are processed securely through our platform and held in escrow until service completion is confirmed. ExpertsHub charges a platform fee on bookings, which is included in the displayed price.
      </p>

      <h2>5. Platform Conduct</h2>
      <p>
        ExpertsHub reserves the right to suspend or terminate accounts that engage in fraud, harassment, impersonation, or any other prohibited activity. We take community safety very seriously.
      </p>

      <h2>6. Intellectual Property</h2>
      <p>
        All content, branding, and technology on ExpertsHub is our intellectual property. You may not copy, reproduce, or distribute any part of the platform without explicit written permission.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        ExpertsHub facilitates connections between customers and professionals but is not liable for the quality of services beyond our guarantee policy. We are not liable for indirect or consequential damages arising from use of the platform.
      </p>

      <h2>8. Changes to Terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms. We will notify you of significant changes via email.
      </p>

      <h2>9. Contact</h2>
      <p>
        For any legal queries, contact us at <strong>legal@ExpertsHub.com</strong>.
      </p>
    </LegalLayout>
  );
}
