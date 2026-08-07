import Link from "next/link";
import { notFound } from "next/navigation";

import { EventEditForm } from "@/components/event-edit-form";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function jsonToStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

export default async function EventoDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const [event, categories] = await Promise.all([
    prisma.event.findUnique({
      include: {
        createdBy: { select: { email: true, name: true } },
        images: {
          orderBy: [{ kind: "asc" }, { order: "asc" }],
          select: { kind: true, url: true },
        },
        places: {
          orderBy: { order: "asc" },
          select: {
            description: true,
            main_text: true,
            role: true,
          },
        },
        _count: { select: { participants: true } },
      },
      where: { id },
    }),
    prisma.eventCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm text-accent hover:underline" href="/eventos">
          ← Voltar
        </Link>
        <h1 className="page-title mt-2">{event.title}</h1>
        <p className="page-subtitle">
          Organizador: {event.createdBy.name} ({event.createdBy.email}) ·{" "}
          {event._count.participants} inscritos
        </p>
      </div>

      {event.places.length > 0 ? (
        <div className="panel-card p-4 text-sm">
          <p className="font-medium">Locais</p>
          <ul className="mt-2 space-y-1 text-muted">
            {event.places.map((place, index) => (
              <li key={`${place.role}-${index}`}>
                <span className="font-medium text-foreground">{place.role}</span>
                : {place.main_text || place.description}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {event.images.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {event.images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={image.kind}
              className="h-24 w-24 rounded-lg object-cover"
              key={image.url}
              src={image.url}
            />
          ))}
        </div>
      ) : null}

      <EventEditForm
        categories={categories}
        event={{
          cancellation_reason: event.cancellation_reason,
          category: event.category,
          date: toDateInputValue(event.date),
          description: event.description,
          end_time: event.end_time,
          id: event.id,
          included: jsonToStringArray(event.included),
          is_deleted: event.is_deleted,
          participant_limit: event.participant_limit,
          requirements: jsonToStringArray(event.requirements),
          start_time: event.start_time,
          title: event.title,
        }}
      />
    </div>
  );
}
