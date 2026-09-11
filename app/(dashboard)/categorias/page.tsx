import { EventCategoryManager } from "@/components/event-category-manager";
import { prisma } from "@/lib/prisma";

export default async function CategoriasPage() {
  const rows = await prisma.eventCategory.findMany({
    orderBy: [{ is_active: "desc" }, { name: "asc" }],
  });

  const categories = rows.map((row) => ({
    id: row.id,
    isActive: row.is_active,
    name: row.name,
    updatedAt: row.updated_at.toLocaleString("pt-BR"),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Categorias de eventos</h1>
        <p className="page-subtitle">
          Crie, edite e inative as categorias usadas nos filtros e no cadastro de
          eventos.
        </p>
      </div>

      <EventCategoryManager categories={categories} />
    </div>
  );
}
