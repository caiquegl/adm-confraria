"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { nestLogin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    select: {
      email: true,
      id: true,
      is_active: true,
      is_admin: true,
      name: true,
      password: true,
    },
    where: { email },
  });

  if (!user || !user.is_active || !user.is_admin) {
    return { error: "Acesso negado. Verifique suas credenciais de admin." };
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    return { error: "Acesso negado. Verifique suas credenciais de admin." };
  }

  let apiToken: string;
  try {
    const nest = await nestLogin(email, password);
    apiToken = nest.token;
  } catch {
    return {
      error:
        "Login local ok, mas a API Nest está indisponível. Inicie o backend.",
    };
  }

  await setSessionCookie({
    apiToken,
    email: user.email,
    name: user.name,
    userId: user.id,
  });

  redirect("/usuarios");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
