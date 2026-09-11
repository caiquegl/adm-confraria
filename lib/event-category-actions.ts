"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { admLog } from "@/lib/adm-log";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type CategoryActionResult = {
  at?: number;
  error?: string;
  success?: string;
};

const nameSchema = z
  .string()
  .trim()
  .min(2, "Nome muito curto")
  .max(60, "Nome muito longo");

export async function createEventCategoryAction(
  _prev: CategoryActionResult,
  formData: FormData,
): Promise<CategoryActionResult> {
  await requireSession();

  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return {
      at: Date.now(),
      error: parsed.error.issues[0]?.message ?? "Nome inválido",
    };
  }

  const name = parsed.data;

  try {
    await prisma.eventCategory.create({
      data: { is_active: true, name },
    });
  } catch {
    return {
      at: Date.now(),
      error: "Já existe uma categoria com esse nome",
    };
  }

  admLog.info("event.category.create", { name });
  revalidatePath("/categorias");
  revalidatePath("/eventos/novo");
  return { at: Date.now(), success: "Categoria criada." };
}

export async function updateEventCategoryAction(
  _prev: CategoryActionResult,
  formData: FormData,
): Promise<CategoryActionResult> {
  await requireSession();

  const id = String(formData.get("id") ?? "").trim();
  const parsed = nameSchema.safeParse(formData.get("name"));

  if (!id) {
    return { at: Date.now(), error: "Categoria inválida" };
  }
  if (!parsed.success) {
    return {
      at: Date.now(),
      error: parsed.error.issues[0]?.message ?? "Nome inválido",
    };
  }

  const name = parsed.data;
  const current = await prisma.eventCategory.findUnique({ where: { id } });
  if (!current) {
    return { at: Date.now(), error: "Categoria não encontrada" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.eventCategory.update({
        data: { name },
        where: { id },
      });

      if (current.name !== name) {
        await tx.event.updateMany({
          data: { category: name },
          where: { category: current.name },
        });
      }
    });
  } catch {
    return {
      at: Date.now(),
      error: "Já existe uma categoria com esse nome",
    };
  }

  admLog.info("event.category.update", {
    categoryId: id,
    from: current.name,
    to: name,
  });
  revalidatePath("/categorias");
  revalidatePath("/eventos");
  revalidatePath("/eventos/novo");
  return { at: Date.now(), success: "Categoria atualizada." };
}

export async function setEventCategoryActiveAction(
  _prev: CategoryActionResult,
  formData: FormData,
): Promise<CategoryActionResult> {
  await requireSession();

  const id = String(formData.get("id") ?? "").trim();
  const nextActive = String(formData.get("isActive") ?? "") === "true";

  if (!id) {
    return { at: Date.now(), error: "Categoria inválida" };
  }

  const updated = await prisma.eventCategory.update({
    data: { is_active: nextActive },
    where: { id },
  });

  admLog.info("event.category.toggle", {
    categoryId: id,
    isActive: nextActive,
    name: updated.name,
  });
  revalidatePath("/categorias");
  revalidatePath("/eventos/novo");
  return {
    at: Date.now(),
    success: nextActive ? "Categoria reativada." : "Categoria inativada.",
  };
}
