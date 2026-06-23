import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Briefs",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
