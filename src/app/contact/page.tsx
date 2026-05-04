"use client";

import { Mail } from "lucide-react";
import { submitContactForm, type ContactState } from './actions';
import { useActionState } from 'react';

const initialState: ContactState = { ok: null };

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
      <p className="mt-3 text-stone-600">
        Have a question, suggestion, or just want to say hello? We&apos;d love to hear from you.
      </p>

      {/* Contact Form */}
      <div className="mt-8 rounded-xl border border-stone-200 bg-white p-6 sm:p-8">
        <form className="space-y-6" action={formAction}>
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
            <label htmlFor="subject" className="block text-sm font-medium text-stone-700">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              className="mt-1 block w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Recipe Correction">Recipe Correction</option>
              <option value="Partnership">Partnership</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Other">Other</option>
            </select>
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
            disabled={isPending}
            className="w-full rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Sending...' : 'Send Message'}
          </button>

          {state.ok === true && (
            <p className="text-sm text-green-600 text-center">✅ Message sent! We&apos;ll get back to you soon.</p>
          )}
          {state.ok === false && (
            <p className="text-sm text-red-600 text-center">❌ {state.error || 'Failed'}</p>
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
