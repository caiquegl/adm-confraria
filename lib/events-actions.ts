"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { nestFetch } from "@/lib/api";
import {
  normalizePlaceReference,
  type EventPlaceReference,
} from "@/lib/places";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type ActionResult = {
  error?: string;
  success?: string;
  at?: number;
};

const updateEventSchema = z.object({
  category: z.string().min(1),
  date: z.string().min(1),
  description: z.string().optional(),
  end_time: z.string().optional(),
  eventId: z.string().uuid(),
  included: z.string().optional(),
  participant_limit: z.string().optional(),
  requirements: z.string().optional(),
  start_time: z.string().optional(),
  title: z.string().min(1),
});

function parseLines(value?: string) {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function updateEventAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();

  const parsed = updateEventSchema.safeParse({
    category: formData.get("category"),
    date: formData.get("date"),
    description: String(formData.get("description") ?? ""),
    end_time: String(formData.get("end_time") ?? ""),
    eventId: formData.get("eventId"),
    included: String(formData.get("included") ?? ""),
    participant_limit: String(formData.get("participant_limit") ?? ""),
    requirements: String(formData.get("requirements") ?? ""),
    start_time: String(formData.get("start_time") ?? ""),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return {
      at: Date.now(),
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const data = parsed.data;
  const limitRaw = data.participant_limit?.trim();
  const participantLimit = limitRaw ? Number(limitRaw) : null;

  if (limitRaw && (!Number.isFinite(participantLimit) || participantLimit! < 1)) {
    return { at: Date.now(), error: "Limite de participantes inválido" };
  }

  await prisma.event.update({
    data: {
      category: data.category.trim(),
      date: new Date(data.date),
      description: data.description?.trim() || null,
      end_time: data.end_time?.trim() || null,
      included: parseLines(data.included),
      participant_limit: participantLimit,
      requirements: parseLines(data.requirements),
      start_time: data.start_time?.trim() || null,
      title: data.title.trim(),
    },
    where: { id: data.eventId },
  });

  revalidatePath("/eventos");
  revalidatePath(`/eventos/${data.eventId}`);
  return { at: Date.now(), success: "Evento atualizado." };
}

export async function cancelEventAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();

  const eventId = String(formData.get("eventId") ?? "");
  const reason = String(formData.get("cancellation_reason") ?? "").trim();

  if (!eventId) {
    return { at: Date.now(), error: "Evento inválido" };
  }
  if (!reason) {
    return { at: Date.now(), error: "Informe o motivo do cancelamento" };
  }

  await prisma.event.update({
    data: {
      cancellation_reason: reason,
      is_deleted: true,
    },
    where: { id: eventId },
  });

  revalidatePath("/eventos");
  revalidatePath(`/eventos/${eventId}`);
  return { at: Date.now(), success: "Evento cancelado." };
}

export async function restoreEventAction(eventId: string): Promise<ActionResult> {
  await requireSession();

  await prisma.event.update({
    data: {
      cancellation_reason: null,
      is_deleted: false,
    },
    where: { id: eventId },
  });

  revalidatePath("/eventos");
  revalidatePath(`/eventos/${eventId}`);
  return { at: Date.now(), success: "Evento restaurado." };
}

export async function createEventViaApiAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const hasParticipantLimit = formData.get("hasParticipantLimit") === "on";
  const maxParticipantsRaw = String(formData.get("maxParticipants") ?? "");
  const included = parseLines(String(formData.get("included") ?? ""));
  const requirements = parseLines(String(formData.get("requirements") ?? ""));
  const locationRaw = String(formData.get("locationJson") ?? "");

  if (!title || !category || !date) {
    return {
      at: Date.now(),
      error: "Título, categoria e data são obrigatórios",
    };
  }

  let location: EventPlaceReference;
  try {
    location = normalizePlaceReference(JSON.parse(locationRaw));
  } catch {
    return {
      at: Date.now(),
      error: "Selecione um ponto de encontro válido",
    };
  }

  let destination: EventPlaceReference | null = null;
  const destinationRaw = String(formData.get("destinationJson") ?? "").trim();
  if (destinationRaw) {
    try {
      destination = normalizePlaceReference(JSON.parse(destinationRaw));
    } catch {
      return { at: Date.now(), error: "Destino inválido" };
    }
  }

  let stops: EventPlaceReference[] = [];
  const stopsRaw = String(formData.get("stopsJson") ?? "").trim();
  if (stopsRaw) {
    try {
      const parsedStops = JSON.parse(stopsRaw) as unknown;
      if (!Array.isArray(parsedStops)) {
        throw new Error("stops inválido");
      }
      stops = parsedStops.map((stop) => normalizePlaceReference(stop));
    } catch {
      return { at: Date.now(), error: "Paradas inválidas" };
    }
  }

  // date from input type=date is YYYY-MM-DD; Nest expects Brazilian DD/MM/YYYY
  const [year, month, day] = date.split("-");
  const brazilianDate =
    year && month && day ? `${day}/${month}/${year}` : date;

  const payload = {
    category,
    date: brazilianDate,
    description: description || null,
    destination,
    endTime: endTime || null,
    hasParticipantLimit,
    included,
    location,
    maxParticipants: hasParticipantLimit
      ? Number(maxParticipantsRaw) || null
      : null,
    requirements,
    startTime: startTime || null,
    stops,
    title,
  };

  const body = new FormData();
  body.append("payload", JSON.stringify(payload));

  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) {
    body.append("cover", cover);
  }

  const gallery = formData.getAll("gallery");
  for (const file of gallery) {
    if (file instanceof File && file.size > 0) {
      body.append("gallery", file);
    }
  }

  const response = await nestFetch("/events", session.apiToken, {
    body,
    method: "POST",
  });

  if (!response.ok) {
    const text = await response.text();
    let message = "Falha ao criar evento na API";
    try {
      const json = JSON.parse(text) as { message?: string | string[] };
      if (typeof json.message === "string") {
        message = json.message;
      } else if (Array.isArray(json.message)) {
        message = json.message.join(", ");
      }
    } catch {
      // keep default
    }
    return { at: Date.now(), error: message };
  }

  const created = (await response.json()) as { id: string };
  revalidatePath("/eventos");
  redirect(`/eventos/${created.id}`);
}
