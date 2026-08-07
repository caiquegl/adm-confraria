import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <AdminShell userName={session.name}>{children}</AdminShell>;
}
