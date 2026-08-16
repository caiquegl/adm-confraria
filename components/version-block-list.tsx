"use client";

import Link from "next/link";
import { useActionState } from "react";

import { useActionToast } from "@/lib/use-action-toast";
import { deleteVersionBlockAction } from "@/lib/version-policy-actions";
import type {
  VersionBlockRow,
  VersionPolicyActionResult,
} from "@/lib/version-policy";

const initial: VersionPolicyActionResult = {};

type VersionBlockListProps = {
  blocks: VersionBlockRow[];
};

export function VersionBlockList({ blocks }: VersionBlockListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Tipo</th>
            <th className="px-4 py-3 font-semibold">Exigência</th>
            <th className="px-4 py-3 font-semibold">Mensagem</th>
            <th className="px-4 py-3 font-semibold">Criado</th>
            <th className="px-4 py-3 font-semibold text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr className="border-b border-border last:border-0" key={block.id}>
              <td className="px-4 py-3 font-medium">
                {block.kind === "store" ? "Loja" : "EAS Update"}
              </td>
              <td className="px-4 py-3">
                {block.kind === "store"
                  ? block.minAppVersion ?? "—"
                  : block.minOtaVersion != null
                    ? `OTA ${block.minOtaVersion}`
                    : "—"}
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-muted">
                {block.message ?? "Padrão do app"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted">
                {block.createdAt}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    className="font-semibold text-accent hover:underline"
                    href={`/versoes/${block.id}`}
                  >
                    Editar
                  </Link>
                  <RemoveBlockButton id={block.id} />
                </div>
              </td>
            </tr>
          ))}
          {blocks.length === 0 ? (
            <tr>
              <td className="px-4 py-10 text-center text-muted" colSpan={5}>
                Nenhum bloqueio neste canal. O app não é obrigado a atualizar.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function RemoveBlockButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    deleteVersionBlockAction,
    initial,
  );

  useActionToast(state);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("Remover este bloqueio?")) {
          event.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={id} />
      <button
        className="font-semibold text-danger hover:underline disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Removendo..." : "Remover"}
      </button>
    </form>
  );
}
