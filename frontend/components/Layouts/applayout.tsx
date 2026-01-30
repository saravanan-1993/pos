"use client";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex-1">{children}</main>;
}
