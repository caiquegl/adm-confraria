"use client";

import { useActionState, useTransition } from "react";
import { toast } from "sonner";

import { useActionToast } from "@/lib/use-action-toast";
import {
  deactivateUserAction,
  reactivateUserAction,
  setAdminFlagAction,
  updateUserAction,
  type ActionResult,
} from "@/lib/users-actions";

type UserEditFormProps = {
  currentUserId: string;
  user: {
    bio: string | null;
    email: string;
    id: string;
    is_active: boolean;
    is_admin: boolean;
    localization: string | null;
    name: string;
    phone: string | null;
    show_email: boolean;
    show_phone: boolean;
    username: string;
  };
};

const initial: ActionResult = {};

export function UserEditForm({ currentUserId, user }: UserEditFormProps) {
  const [state, formAction, pending] = useActionState(updateUserAction, initial);
  const [isPending, startTransition] = useTransition();

  useActionToast(state);

  function runStatusAction(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="panel-card space-y-4 p-5 sm:p-6">
        <input name="userId" type="hidden" value={user.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Nome</span>
            <input
              className="field-input"
              defaultValue={user.name}
              name="name"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Username</span>
            <input
              className="field-input"
              defaultValue={user.username}
              name="username"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">E-mail</span>
            <input
              className="field-input"
              defaultValue={user.email}
              name="email"
              required
              type="email"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Telefone</span>
            <input
              className="field-input"
              defaultValue={user.phone ?? ""}
              name="phone"
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Localização</span>
            <input
              className="field-input"
              defaultValue={user.localization ?? ""}
              name="localization"
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Bio</span>
            <textarea
              className="field-input"
              defaultValue={user.bio ?? ""}
              name="bio"
              rows={3}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              defaultChecked={user.show_email}
              name="show_email"
              type="checkbox"
            />
            Mostrar e-mail
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              defaultChecked={user.show_phone}
              name="show_phone"
              type="checkbox"
            />
            Mostrar telefone
          </label>
        </div>

        <button className="btn-primary" disabled={pending} type="submit">
          {pending ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      <div className="panel-card flex flex-wrap gap-3 p-5 sm:p-6">
        {user.is_active ? (
          <button
            className="rounded-xl border border-danger px-4 py-2 text-sm font-medium text-danger disabled:opacity-60"
            disabled={isPending || currentUserId === user.id}
            onClick={() => runStatusAction(() => deactivateUserAction(user.id))}
            type="button"
          >
            Inativar usuário
          </button>
        ) : (
          <button
            className="rounded-xl border border-accent px-4 py-2 text-sm font-medium text-accent disabled:opacity-60"
            disabled={isPending}
            onClick={() => runStatusAction(() => reactivateUserAction(user.id))}
            type="button"
          >
            Reativar usuário
          </button>
        )}

        {user.is_admin ? (
          <button
            className="btn-secondary disabled:opacity-60"
            disabled={isPending || currentUserId === user.id}
            onClick={() =>
              runStatusAction(() => setAdminFlagAction(user.id, false))
            }
            type="button"
          >
            Remover admin
          </button>
        ) : (
          <button
            className="btn-secondary disabled:opacity-60"
            disabled={isPending}
            onClick={() =>
              runStatusAction(() => setAdminFlagAction(user.id, true))
            }
            type="button"
          >
            Tornar admin
          </button>
        )}
      </div>
    </div>
  );
}
