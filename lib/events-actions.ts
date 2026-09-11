"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";

import { admLog } from "@/lib/adm-log";
import { nestFetch } from "@/lib/api";
import {
  calendarDateAtNoonFromInstant,
  isValidHhMm,
  isoDateToBrazilian,
  parseBrazilDateTime,
} from "@/lib/event-period";
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
  description: z.string().optional(),
  end_date: z.string().min(1),
  end_time: z.string().min(1),
  eventId: z.string().uuid(),
  included: z.string().optional(),
  participant_limit: z.string().optional(),
  requirements: z.string().optional(),
  start_date: z.string().min(1),
  start_time: z.string().min(1),
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

function resolveFormPeriod(
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
):
  | { error: string }
  | {
      date: Date;
      endTime: string;
      endsAt: Date;
      startTime: string;
      startsAt: Date;
    } {
  if (!isValidHhMm(startTime)) {
    return { error: "Horário de início inválido" };
  }
  if (!isValidHhMm(endTime)) {
    return { error: "Horário de término inválido" };
  }

  const startsAt = parseBrazilDateTime(startDate, startTime);
  const endsAt = parseBrazilDateTime(endDate, endTime);

  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Data de início inválida" };
  }
  if (Number.isNaN(endsAt.getTime())) {
    return { error: "Data de término inválida" };
  }
  if (endsAt.getTime() <= startsAt.getTime()) {
    return { error: "O término deve ser posterior ao início" };
  }

  return {
    date: calendarDateAtNoonFromInstant(startsAt),
    endTime,
    endsAt,
    startTime,
    startsAt,
  };
}

export async function updateEventAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();

  const parsed = updateEventSchema.safeParse({
    category: formData.get("category"),
    description: String(formData.get("description") ?? ""),
    end_date: formData.get("end_date"),
    end_time: String(formData.get("end_time") ?? ""),
    eventId: formData.get("eventId"),
    included: String(formData.get("included") ?? ""),
    participant_limit: String(formData.get("participant_limit") ?? ""),
    requirements: String(formData.get("requirements") ?? ""),
    start_date: formData.get("start_date"),
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

  const period = resolveFormPeriod(
    data.start_date.trim(),
    data.end_date.trim(),
    data.start_time.trim(),
    data.end_time.trim(),
  );

  if ("error" in period) {
    return { at: Date.now(), error: period.error };
  }

  await prisma.event.update({
    data: {
      category: data.category.trim(),
      date: period.date,
      description: data.description?.trim() || null,
      end_time: period.endTime,
      ends_at: period.endsAt,
      included: parseLines(data.included),
      participant_limit: participantLimit,
      requirements: parseLines(data.requirements),
      start_time: period.startTime,
      starts_at: period.startsAt,
      title: data.title.trim(),
    },
    where: { id: data.eventId },
  });

  admLog.info("event updated", { eventId: data.eventId });
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

/** Keep under Vercel request body + Next serverActions.bodySizeLimit (4.5mb). */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_SINGLE_FILE_BYTES = 5 * 1024 * 1024;

async function appendUploadFile(
  body: FormData,
  field: string,
  file: File,
): Promise<string | null> {
  if (file.size <= 0) return null;
  if (file.size > MAX_SINGLE_FILE_BYTES) {
    return `Arquivo "${file.name}" excede 5 MB`;
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  body.append(
    field,
    new Blob([bytes], { type: file.type || "application/octet-stream" }),
    file.name || field,
  );
  return null;
}

export async function createEventViaApiAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await requireSession();

    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const startDate = String(formData.get("startDate") ?? "").trim();
    const endDate = String(formData.get("endDate") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const startTime = String(formData.get("startTime") ?? "").trim();
    const endTime = String(formData.get("endTime") ?? "").trim();
    const hasParticipantLimit = formData.get("hasParticipantLimit") === "on";
    const maxParticipantsRaw = String(formData.get("maxParticipants") ?? "");
    const included = parseLines(String(formData.get("included") ?? ""));
    const requirements = parseLines(String(formData.get("requirements") ?? ""));
    const locationRaw = String(formData.get("locationJson") ?? "");

    if (!title || !category || !startDate || !endDate) {
      return {
        at: Date.now(),
        error:
          "Título, categoria, data de início e data de término são obrigatórios",
      };
    }

    const period = resolveFormPeriod(startDate, endDate, startTime, endTime);
    if ("error" in period) {
      return { at: Date.now(), error: period.error };
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

    // HTML date inputs are YYYY-MM-DD; Nest expects Brazilian DD/MM/YYYY
    const brazilianStartDate = isoDateToBrazilian(startDate);
    const brazilianEndDate = isoDateToBrazilian(endDate);

    const payload = {
      category,
      date: brazilianStartDate,
      description: description || null,
      destination,
      endDate: brazilianEndDate,
      endTime: period.endTime,
      hasParticipantLimit,
      included,
      location,
      maxParticipants: hasParticipantLimit
        ? Number(maxParticipantsRaw) || null
        : null,
      requirements,
      startDate: brazilianStartDate,
      startTime: period.startTime,
      stops,
      title,
    };

    const body = new FormData();
    body.append("payload", JSON.stringify(payload));

    let uploadBytes = 0;
    const cover = formData.get("cover");
    if (cover instanceof File && cover.size > 0) {
      uploadBytes += cover.size;
      const coverError = await appendUploadFile(body, "cover", cover);
      if (coverError) {
        return { at: Date.now(), error: coverError };
      }
    }

    const gallery = formData.getAll("gallery");
    for (const file of gallery) {
      if (!(file instanceof File) || file.size <= 0) continue;
      uploadBytes += file.size;
      const galleryError = await appendUploadFile(body, "gallery", file);
      if (galleryError) {
        return { at: Date.now(), error: galleryError };
      }
    }

    if (uploadBytes > MAX_UPLOAD_BYTES) {
      return {
        at: Date.now(),
        error:
          "Imagens muito grandes no total (máx. ~4 MB). Reduza a qualidade ou envie menos fotos.",
      };
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
      admLog.warn("event create failed", {
        path: "/events",
        status: response.status,
      });
      return { at: Date.now(), error: message };
    }

    const created = (await response.json()) as { id: string };
    admLog.info("event created", { eventId: created.id });
    revalidatePath("/eventos");
    redirect(`/eventos/${created.id}`);
  } catch (error) {
    unstable_rethrow(error);
    const message =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? "Sessão expirada. Entre novamente."
        : error instanceof Error
          ? error.message
          : "Falha inesperada ao criar evento";
    console.error("[adm] event create crashed", error);
    admLog.error("event create crashed", { message });
    return { at: Date.now(), error: message };
  }
}
