import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Zaffaron. We'd love to hear from you!",
  alternates: {
    canonical: "https://zaffaron.com/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact Us</h1>
      <p className="mt-3 text-stone-600">
        Have a question, suggestion, or just want to say hello? We&apos;d love to hear from you.
      </p>

      {/* Contact Form */}
      <div className="mt-8 rounded-xl border border-stone-200 bg-white p-6 sm:p-8">
        <form className="space-y-6" action="#" method="POST">
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

          <button
            type="submit"
            className="w-full rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Email contact */}
      <div className="mt-8 text-center">
        <p className="text-sm text-stone-500">Or reach us directly at</p>
        <a
          href="mailto:mehdi@smarterbroadcast.com"
          className="mt-2 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700"
        >
          <Mail className="h-4 w-4" />
          mehdi@smarterbroadcast.com
        </a>
      </div>
    </div>
  );
}
