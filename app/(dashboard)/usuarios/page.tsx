import Link from "next/link";

import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ q?: string }>;

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      email: true,
      id: true,
      is_active: true,
      is_admin: true,
      is_vip: true,
      name: true,
      username: true,
    },
    take: 100,
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">Gerencie contas da plataforma.</p>
        </div>
        <form className="flex items-center gap-2">
          <input
            className="field-input-sm w-56 sm:w-64"
            defaultValue={query}
            name="q"
            placeholder="Nome, e-mail ou username"
          />
          <button className="btn-primary-sm" type="submit">
            Buscar
          </button>
        </form>
      </div>

      <div className="panel-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-accent-soft/60 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Flags</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr className="border-b border-border last:border-0" key={user.id}>
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3">@{user.username}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.is_admin ? (
                      <span className="rounded-full bg-brand-green px-2 py-0.5 text-xs font-semibold text-brand-dark">
                        admin
                      </span>
                    ) : null}
                    {user.is_vip ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-warning">
                        vip
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {user.is_active ? (
                    <span className="font-medium text-accent">Ativo</span>
                  ) : (
                    <span className="font-medium text-danger">Inativo</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    className="font-semibold text-accent hover:underline"
                    href={`/usuarios/${user.id}`}
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-muted" colSpan={6}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
