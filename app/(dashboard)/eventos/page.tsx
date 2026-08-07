import Link from "next/link";

import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ q?: string; status?: string }>;

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export default async function EventosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, status } = await searchParams;
  const query = q?.trim() ?? "";

  const events = await prisma.event.findMany({
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { date: "desc" },
    take: 100,
    where: {
      AND: [
        query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { category: { contains: query, mode: "insensitive" } },
              ],
            }
          : {},
        status === "active"
          ? { is_deleted: false }
          : status === "cancelled"
            ? { is_deleted: true }
            : {},
      ],
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Eventos</h1>
          <p className="page-subtitle">
            Liste, edite e crie eventos da plataforma.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form className="flex items-center gap-2">
            <input
              className="field-input-sm w-48 sm:w-56"
              defaultValue={query}
              name="q"
              placeholder="Título ou categoria"
            />
            <select
              className="field-input-sm w-28"
              defaultValue={status ?? "all"}
              name="status"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="cancelled">Cancelados</option>
            </select>
            <button className="btn-primary-sm" type="submit">
              Filtrar
            </button>
          </form>
          <Link className="btn-primary-sm" href="/eventos/novo">
            Novo evento
          </Link>
        </div>
      </div>

      <div className="panel-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-accent-soft/60 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Organizador</th>
              <th className="px-4 py-3 font-medium">Inscritos</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                className="border-b border-border last:border-0"
                key={event.id}
              >
                <td className="px-4 py-3 font-medium">{event.title}</td>
                <td className="px-4 py-3">{event.category}</td>
                <td className="px-4 py-3">{formatDate(event.date)}</td>
                <td className="px-4 py-3 text-muted">{event.createdBy.name}</td>
                <td className="px-4 py-3">{event._count.participants}</td>
                <td className="px-4 py-3">
                  {event.is_deleted ? (
                    <span className="font-medium text-danger">Cancelado</span>
                  ) : (
                    <span className="font-medium text-accent">Ativo</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    className="font-semibold text-accent hover:underline"
                    href={`/eventos/${event.id}`}
                  >
                    Gerenciar
                  </Link>
                </td>
              </tr>
            ))}
            {events.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-muted" colSpan={7}>
                  Nenhum evento encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
