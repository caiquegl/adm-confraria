"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const VERSION_CHANNELS = ["production", "preview"] as const;

export type VersionChannel = (typeof VERSION_CHANNELS)[number];

export type ActionResult = {
  at?: number;
  error?: string;
  success?: string;
};

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

const updatePolicySchema = z.object({
  androidStoreUrl: z.string().url("URL Android inválida").nullable(),
  channel: z.enum(VERSION_CHANNELS),
  iosStoreUrl: z.string().url("URL iOS inválida").nullable(),
  messageOta: z.string().max(500).nullable(),
  messageStore: z.string().max(500).nullable(),
  minAppVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Use semver (ex.: 1.0.1)")
    .nullable(),
  minOtaVersion: z.number().int().positive("OTA deve ser um inteiro positivo").nullable(),
});

export async function updateVersionPolicyAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const minOtaRaw = emptyToNull(formData.get("minOtaVersion"));
  const minOtaVersion =
    minOtaRaw == null ? null : Number.parseInt(minOtaRaw, 10);

  const parsed = updatePolicySchema.safeParse({
    androidStoreUrl: emptyToNull(formData.get("androidStoreUrl")),
    channel: formData.get("channel"),
    iosStoreUrl: emptyToNull(formData.get("iosStoreUrl")),
    messageOta: emptyToNull(formData.get("messageOta")),
    messageStore: emptyToNull(formData.get("messageStore")),
    minAppVersion: emptyToNull(formData.get("minAppVersion")),
    minOtaVersion:
      minOtaRaw == null ? null : Number.isFinite(minOtaVersion) ? minOtaVersion : minOtaRaw,
  });

  if (!parsed.success) {
    return {
      at: Date.now(),
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const data = parsed.data;

  await prisma.appVersionPolicy.upsert({
    create: {
      android_store_url: data.androidStoreUrl,
      channel: data.channel,
      ios_store_url: data.iosStoreUrl,
      message_ota: data.messageOta,
      message_store: data.messageStore,
      min_app_version: data.minAppVersion,
      min_ota_version: data.minOtaVersion,
      updated_by_user_id: session.userId,
    },
    update: {
      android_store_url: data.androidStoreUrl,
      ios_store_url: data.iosStoreUrl,
      message_ota: data.messageOta,
      message_store: data.messageStore,
      min_app_version: data.minAppVersion,
      min_ota_version: data.minOtaVersion,
      updated_by_user_id: session.userId,
    },
    where: { channel: data.channel },
  });

  revalidatePath("/versoes");
  return { at: Date.now(), success: "Política de versão salva." };
}
