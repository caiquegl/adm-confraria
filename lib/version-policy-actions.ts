"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import {
  VERSION_CHANNELS,
  type VersionPolicyActionResult,
} from "@/lib/version-policy";

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

const createBlockSchema = z.discriminatedUnion("kind", [
  z.object({
    androidStoreUrl: z.string().url("URL Android inválida").nullable(),
    channel: z.enum(VERSION_CHANNELS),
    iosStoreUrl: z.string().url("URL iOS inválida").nullable(),
    kind: z.literal("store"),
    message: z.string().max(500).nullable(),
    minAppVersion: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/, "Use semver (ex.: 1.0.1)"),
  }),
  z.object({
    channel: z.enum(VERSION_CHANNELS),
    kind: z.literal("ota"),
    message: z.string().max(500).nullable(),
    minOtaVersion: z.number().int().positive("OTA deve ser um inteiro positivo"),
  }),
]);

export async function createVersionBlockAction(
  _prev: VersionPolicyActionResult,
  formData: FormData,
): Promise<VersionPolicyActionResult> {
  const session = await requireSession();
  const kindRaw = emptyToNull(formData.get("kind"));
  const minOtaRaw = emptyToNull(formData.get("minOtaVersion"));
  const minOtaVersion =
    minOtaRaw == null ? null : Number.parseInt(minOtaRaw, 10);

  const parsed = createBlockSchema.safeParse(
    kindRaw === "ota"
      ? {
          channel: formData.get("channel"),
          kind: "ota",
          message: emptyToNull(formData.get("message")),
          minOtaVersion:
            minOtaRaw == null
              ? null
              : Number.isFinite(minOtaVersion)
                ? minOtaVersion
                : minOtaRaw,
        }
      : {
          androidStoreUrl: emptyToNull(formData.get("androidStoreUrl")),
          channel: formData.get("channel"),
          iosStoreUrl: emptyToNull(formData.get("iosStoreUrl")),
          kind: "store",
          message: emptyToNull(formData.get("message")),
          minAppVersion: emptyToNull(formData.get("minAppVersion")),
        },
  );

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
            android_store_url: data.androidStoreUrl,
            channel: data.channel,
            created_by_user_id: session.userId,
            ios_store_url: data.iosStoreUrl,
            kind: data.kind,
            message: data.message,
            min_app_version: data.minAppVersion,
          }
        : {
            channel: data.channel,
            created_by_user_id: session.userId,
            kind: data.kind,
            message: data.message,
            min_ota_version: data.minOtaVersion,
          },
  });

  revalidatePath("/versoes");
  return { at: Date.now(), success: "Bloqueio adicionado." };
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
