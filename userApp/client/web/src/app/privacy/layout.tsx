import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Protocol",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
