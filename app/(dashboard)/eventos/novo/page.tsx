import Link from "next/link";

import { EventCreateForm } from "@/components/event-create-form";
import { prisma } from "@/lib/prisma";

export default async function NovoEventoPage() {
  const categories = await prisma.eventCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm text-accent hover:underline" href="/eventos">
          ← Voltar
        </Link>
        <h1 className="page-title mt-2">Novo evento</h1>
        <p className="page-subtitle">
          Criação completa via API Nest (Places, rota e imagens).
        </p>
      </div>

      <EventCreateForm categories={categories} />
    </div>
  );
}
