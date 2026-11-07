import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff · Fresh Donuts & Deli",
  robots: { index: false, follow: false },
};

export default function StaffLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="mx-auto max-w-xl p-4">{children}</div>;
}
