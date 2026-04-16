import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Create a Family Recipe — Zaffaron Vault",
  description: "Preserve your family's recipe by typing or recording it. Our AI structures ingredients, steps, and timing beautifully.",
  alternates: { canonical: `${SITE_URL}/vault/create` },
  robots: { index: true, follow: true },
};

export default function VaultCreateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
