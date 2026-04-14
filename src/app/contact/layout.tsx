import { SITE_URL } from '@/lib/config';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Zaffaron. We'd love to hear from you!",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
