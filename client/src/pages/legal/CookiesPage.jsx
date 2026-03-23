// Cookie Policy page

import { LegalLayout } from './LegalLayout';
import { usePageTitle } from '../../hooks/usePageTitle';

export function CookiesPage() {
  usePageTitle('Cookie Policy');
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="We use cookies to ensure the platform works properly and to improve your experience."
      lastUpdated="March 1, 2026"
    >
      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and provide a smoother experience.
      </p>

      <h2>2. Essential Cookies</h2>
      <p>
        These cookies are strictly necessary for the platform to function. They enable authentication, session management, and security features. You cannot opt out of these cookies while using ExpertsHub.
      </p>
      <ul>
        <li><strong>auth_token</strong> — Keeps you logged in across page visits</li>
        <li><strong>csrf_token</strong> — Protects against cross-site request forgery</li>
        <li><strong>session_id</strong> — Maintains your active booking session</li>
      </ul>

      <h2>3. Functional Cookies</h2>
      <p>
        These help us remember your preferences like theme (dark/light mode), language, and location settings. They improve usability but are not required for core functionality.
      </p>

      <h2>4. Analytics Cookies</h2>
      <p>
        We use anonymised analytics data to understand how users navigate the platform and identify areas for improvement. This data is aggregated and never tied to individual identities.
      </p>

      <h2>5. Managing Cookies</h2>
      <p>
        You can control or delete cookies through your browser settings. Note that disabling essential cookies may prevent you from logging in or using core features of the platform.
      </p>

      <h2>6. Third-Party Cookies</h2>
      <p>
        Our payment processors and analytics tools may set their own cookies. These are governed by their respective privacy policies. We do not control third-party cookies.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. Material changes will be communicated via email or an in-app notification.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions? Email us at <strong>privacy@ExpertsHub.com</strong>.
      </p>
    </LegalLayout>
  );
}
