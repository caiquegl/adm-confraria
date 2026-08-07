import Link from "next/link";
import { notFound } from "next/navigation";

import { UserEditForm } from "@/components/user-edit-form";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = Promise<{ id: string }>;

export default async function UsuarioDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    select: {
      bio: true,
      email: true,
      id: true,
      is_active: true,
      is_admin: true,
      localization: true,
      name: true,
      phone: true,
      show_email: true,
      show_phone: true,
      username: true,
    },
    where: { id },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm text-accent hover:underline" href="/usuarios">
          ← Voltar
        </Link>
        <h1 className="page-title mt-2">{user.name}</h1>
        <p className="page-subtitle">@{user.username}</p>
      </div>

      <UserEditForm currentUserId={session.userId} user={user} />
    </div>
  );
}
