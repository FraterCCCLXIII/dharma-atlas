import type { Metadata } from "next";
import { ManageShell } from "@/components/manage/ManageShell";
import { getSession } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Manage | Dharma Streams",
  robots: { index: false, follow: false },
};

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    return <>{children}</>;
  }

  return <ManageShell userEmail={session.user.email}>{children}</ManageShell>;
}
