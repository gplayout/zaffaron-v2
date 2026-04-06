"use client";

import { Mail } from "lucide-react";
import { submitContactForm } from './actions';
import { useState } from 'react';
export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
      <p className="mt-3 text-stone-600">
        Have a question, suggestion, or just want to say hello? We&apos;d love to hear from you.
      </p>

      {/* Contact Form */}
      <div className="mt-8 rounded-xl border border-stone-200 bg-white p-6 sm:p-8">
        <form className="space-y-6" action={async (formData) => {
          setSubmitting(true);
          setStatus(null);
          const result = await submitContactForm(formData);
          setSubmitting(false);
          setStatus(result.ok ? 'sent' : result.error || 'Failed');
        }}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-stone-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="mt-1 block w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 resize-y"
              placeholder="How can we help you?"
            />
          </div>

          {/* Honeypot — hidden from real users, bots fill it */}
          <div className="hidden" aria-hidden="true">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>

          {status === 'sent' && (
            <p className="text-sm text-green-600 text-center">✅ Message sent! We&apos;ll get back to you soon.</p>
          )}
          {status && status !== 'sent' && (
            <p className="text-sm text-red-600 text-center">❌ {status}</p>
          )}
        </form>
      </div>

      {/* Email contact */}
      <div className="mt-8 text-center">
        <p className="text-sm text-stone-500">Or reach us directly at</p>
        <a
          href="mailto:hello@zaffaron.com"
          className="mt-2 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700"
        >
          <Mail className="h-4 w-4" />
          hello@zaffaron.com
        </a>
      </div>
    </div>
  );
}
