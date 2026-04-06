import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tahdig Rater — How Good Is Your Tahdig?",
  description:
    "Upload your tahdig photo and let AI rate it! Get scores on color, crispiness, shape, evenness, and presentation. Share your results with friends.",
  alternates: {
    canonical: "https://zaffaron.com/tahdig",
  },
  openGraph: {
    title: "Tahdig Rater - Rate Your Tahdig with AI",
    description: "Upload a photo of your tahdig and get an instant AI rating. How crispy is YOUR tahdig? 🍚",
    url: "https://zaffaron.com/tahdig",
    type: "website",
  },
};

export default function TahdigLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
