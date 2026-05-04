// Server Component shell — Phase 2.5 Fix A (prop drilling).
// Forces bundler to register submitContactForm action-ID into route's
// server-reference-manifest by importing the Server Action through the
// Server Component graph (not exclusively into a Client Component import).
// References: vercel/next.js PR #77012, Issue #69756, Discussion #58431.

import { submitContactForm } from './actions';
import ContactFormClient from './ContactFormClient';

export default function ContactPage() {
  return <ContactFormClient action={submitContactForm} />;
}
