import Link from "next/link";
import { notFound } from "next/navigation";

import { EventEditForm } from "@/components/event-edit-form";
import {
  formatEventPeriodLabel,
  resolveEventFormPeriod,
} from "@/lib/event-period";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

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

  const [event, activeCategories] = await Promise.all([
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
      where: { is_active: true },
    }),
  ]);

  if (!event) {
    notFound();
  }

  const categories = activeCategories.some((item) => item.name === event.category)
    ? activeCategories
    : [{ id: `legacy-${event.category}`, name: event.category }, ...activeCategories];

  const period = resolveEventFormPeriod({
    date: event.date,
    end_time: event.end_time,
    ends_at: event.ends_at,
    start_time: event.start_time,
    starts_at: event.starts_at,
  });

  const periodLabel = formatEventPeriodLabel({
    endsAt: period.endsAt,
    endTime: period.endTime,
    startsAt: period.startsAt,
    startTime: period.startTime,
  });

  return (
    <div className="space-y-6">
      <div>
        <Link className="text-sm text-accent hover:underline" href="/eventos">
          ← Voltar
        </Link>
        <h1 className="page-title mt-2">{event.title}</h1>
        <p className="page-subtitle">
          {periodLabel ? `${periodLabel} · ` : null}
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
          description: event.description,
          end_date: period.endDate,
          end_time: period.endTime,
          id: event.id,
          included: jsonToStringArray(event.included),
          is_deleted: event.is_deleted,
          participant_limit: event.participant_limit,
          requirements: jsonToStringArray(event.requirements),
          start_date: period.startDate,
          start_time: period.startTime,
          title: event.title,
        }}
      />
    </div>
  );
}
