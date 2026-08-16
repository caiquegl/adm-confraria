"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import {
  VERSION_CHANNELS,
  isVersionBlockKind,
  type VersionPolicyActionResult,
} from "@/lib/version-policy";

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

const storeFieldsSchema = z.object({
  androidStoreUrl: z.string().url("URL Android inválida").nullable(),
  iosStoreUrl: z.string().url("URL iOS inválida").nullable(),
  kind: z.literal("store"),
  message: z.string().max(500).nullable(),
  minAppVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Use semver (ex.: 1.0.1)"),
});

const otaFieldsSchema = z.object({
  kind: z.literal("ota"),
  message: z.string().max(500).nullable(),
  minOtaVersion: z.number().int().positive("OTA deve ser um inteiro positivo"),
});

const createBlockSchema = z.discriminatedUnion("kind", [
  storeFieldsSchema.extend({ channel: z.enum(VERSION_CHANNELS) }),
  otaFieldsSchema.extend({ channel: z.enum(VERSION_CHANNELS) }),
]);

function parseKindPayload(formData: FormData, kind: "store" | "ota") {
  const minOtaRaw = emptyToNull(formData.get("minOtaVersion"));
  const minOtaVersion =
    minOtaRaw == null ? null : Number.parseInt(minOtaRaw, 10);

  if (kind === "ota") {
    return {
      kind: "ota" as const,
      message: emptyToNull(formData.get("message")),
      minOtaVersion:
        minOtaRaw == null
          ? null
          : Number.isFinite(minOtaVersion)
            ? minOtaVersion
            : minOtaRaw,
    };
  }

  return {
    androidStoreUrl: emptyToNull(formData.get("androidStoreUrl")),
    iosStoreUrl: emptyToNull(formData.get("iosStoreUrl")),
    kind: "store" as const,
    message: emptyToNull(formData.get("message")),
    minAppVersion: emptyToNull(formData.get("minAppVersion")),
  };
}

function storeUpdateData(data: z.infer<typeof storeFieldsSchema>) {
  return {
    android_store_url: data.androidStoreUrl,
    ios_store_url: data.iosStoreUrl,
    kind: data.kind,
    message: data.message,
    min_app_version: data.minAppVersion,
    min_ota_version: null,
  };
}

function otaUpdateData(data: z.infer<typeof otaFieldsSchema>) {
  return {
    android_store_url: null,
    ios_store_url: null,
    kind: data.kind,
    message: data.message,
    min_app_version: null,
    min_ota_version: data.minOtaVersion,
  };
}

export async function createVersionBlockAction(
  _prev: VersionPolicyActionResult,
  formData: FormData,
): Promise<VersionPolicyActionResult> {
  const session = await requireSession();
  const kindRaw = emptyToNull(formData.get("kind"));
  const kind = isVersionBlockKind(kindRaw) ? kindRaw : "store";

  const parsed = createBlockSchema.safeParse({
    ...parseKindPayload(formData, kind),
    channel: formData.get("channel"),
  });

  if (!parsed.success) {
    return {
      at: Date.now(),
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const data = parsed.data;

  await prisma.appVersionBlock.create({
    data:
      data.kind === "store"
        ? {
            ...storeUpdateData(data),
            channel: data.channel,
            created_by_user_id: session.userId,
          }
        : {
            ...otaUpdateData(data),
            channel: data.channel,
            created_by_user_id: session.userId,
          },
  });

  revalidatePath("/versoes");
  return { at: Date.now(), success: "Bloqueio adicionado." };
}

export async function updateVersionBlockAction(
  _prev: VersionPolicyActionResult,
  formData: FormData,
): Promise<VersionPolicyActionResult> {
  await requireSession();

  const id = emptyToNull(formData.get("id"));
  if (!id) {
    return { at: Date.now(), error: "Bloqueio inválido." };
  }

  const existing = await prisma.appVersionBlock.findUnique({ where: { id } });
  if (!existing || !isVersionBlockKind(existing.kind)) {
    return { at: Date.now(), error: "Bloqueio não encontrado." };
  }

  const parsed =
    existing.kind === "ota"
      ? otaFieldsSchema.safeParse(parseKindPayload(formData, "ota"))
      : storeFieldsSchema.safeParse(parseKindPayload(formData, "store"));

  if (!parsed.success) {
    return {
      at: Date.now(),
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  await prisma.appVersionBlock.update({
    data:
      parsed.data.kind === "store"
        ? storeUpdateData(parsed.data)
        : otaUpdateData(parsed.data),
    where: { id },
  });

  revalidatePath("/versoes");
  revalidatePath(`/versoes/${id}`);
  return { at: Date.now(), success: "Bloqueio atualizado." };
}

export async function deleteVersionBlockAction(
  _prev: VersionPolicyActionResult,
  formData: FormData,
): Promise<VersionPolicyActionResult> {
  await requireSession();

  const id = emptyToNull(formData.get("id"));
  if (!id) {
    return { at: Date.now(), error: "Bloqueio inválido." };
  }

  await prisma.appVersionBlock.delete({ where: { id } }).catch(() => null);

  revalidatePath("/versoes");
  return { at: Date.now(), success: "Bloqueio removido." };
}
