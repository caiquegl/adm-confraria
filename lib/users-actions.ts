"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const updateUserSchema = z.object({
  bio: z.string().optional(),
  email: z.string().email("E-mail inválido"),
  localization: z.string().optional(),
  name: z.string().min(1, "Nome obrigatório"),
  phone: z.string().optional(),
  show_email: z.boolean(),
  show_phone: z.boolean(),
  userId: z.string().uuid(),
  username: z.string().min(1, "Username obrigatório"),
});

export type ActionResult = {
  error?: string;
  success?: string;
  /** força novo toast mesmo com a mesma mensagem */
  at?: number;
};

export async function updateUserAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();

  const parsed = updateUserSchema.safeParse({
    bio: String(formData.get("bio") ?? ""),
    email: formData.get("email"),
    localization: String(formData.get("localization") ?? ""),
    name: formData.get("name"),
    phone: String(formData.get("phone") ?? ""),
    show_email: formData.get("show_email") === "on",
    show_phone: formData.get("show_phone") === "on",
    userId: formData.get("userId"),
    username: formData.get("username"),
  });

  if (!parsed.success) {
    return {
      at: Date.now(),
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const data = parsed.data;

  try {
    await prisma.user.update({
      data: {
        bio: data.bio?.trim() || null,
        email: data.email.trim().toLowerCase(),
        localization: data.localization?.trim() || null,
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        show_email: data.show_email,
        show_phone: data.show_phone,
        username: data.username.trim(),
      },
      where: { id: data.userId },
    });
  } catch {
    return {
      at: Date.now(),
      error: "Não foi possível salvar. E-mail ou username já em uso?",
    };
  }

  revalidatePath("/usuarios");
  revalidatePath(`/usuarios/${data.userId}`);
  return { at: Date.now(), success: "Usuário atualizado." };
}

export async function deactivateUserAction(userId: string): Promise<ActionResult> {
  const session = await requireSession();

  if (session.userId === userId) {
    return { error: "Você não pode inativar a própria conta." };
  }

  await prisma.user.update({
    data: {
      deleted_at: new Date(),
      is_active: false,
    },
    where: { id: userId },
  });

  revalidatePath("/usuarios");
  revalidatePath(`/usuarios/${userId}`);
  return { at: Date.now(), success: "Usuário inativado." };
}

export async function reactivateUserAction(userId: string): Promise<ActionResult> {
  await requireSession();

  await prisma.user.update({
    data: {
      deleted_at: null,
      is_active: true,
    },
    where: { id: userId },
  });

  revalidatePath("/usuarios");
  revalidatePath(`/usuarios/${userId}`);
  return { at: Date.now(), success: "Usuário reativado." };
}

export async function setAdminFlagAction(
  userId: string,
  isAdmin: boolean,
): Promise<ActionResult> {
  const session = await requireSession();

  if (session.userId === userId && !isAdmin) {
    return { error: "Você não pode remover o próprio acesso admin." };
  }

  await prisma.user.update({
    data: { is_admin: isAdmin },
    where: { id: userId },
  });

  revalidatePath("/usuarios");
  revalidatePath(`/usuarios/${userId}`);
  return {
    at: Date.now(),
    success: isAdmin ? "Usuário marcado como admin." : "Admin removido.",
  };
}
