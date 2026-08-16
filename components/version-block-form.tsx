"use client";

import { useActionState, useState } from "react";

import { useActionToast } from "@/lib/use-action-toast";
import { createVersionBlockAction } from "@/lib/version-policy-actions";
import {
  type VersionBlockKind,
  type VersionChannel,
  type VersionPolicyActionResult,
} from "@/lib/version-policy";

const DEFAULT_STORE_MESSAGE =
  "Há uma nova versão do Confraria. Atualize na loja para continuar.";
const DEFAULT_OTA_MESSAGE =
  "Há uma atualização pronta. Feche o app e abra novamente para instalar automaticamente.";

const initial: VersionPolicyActionResult = {};

type VersionBlockFormProps = {
  channel: VersionChannel;
};

export function VersionBlockForm({ channel }: VersionBlockFormProps) {
  const [kind, setKind] = useState<VersionBlockKind>("store");
  const [state, formAction, pending] = useActionState(
    createVersionBlockAction,
    initial,
  );

  useActionToast(state);

  return (
    <form
      action={formAction}
      className="panel-card space-y-4 p-5 sm:p-6"
      key={state.success ? state.at : "form"}
    >
      <input name="channel" type="hidden" value={channel} />
      <input name="kind" type="hidden" value={kind} />

      <div>
        <h2 className="text-base font-semibold">Novo bloqueio</h2>
        <p className="mt-1 text-sm text-muted">
          Cada item entra na lista e pode ser removido depois. Se houver vários
          do mesmo tipo, o app usa o mais restritivo.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <KindButton
          active={kind === "store"}
          label="Loja"
          onClick={() => setKind("store")}
        />
        <KindButton
          active={kind === "ota"}
          label="EAS Update"
          onClick={() => setKind("ota")}
        />
      </div>

      {kind === "store" ? (
        <>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Versão mínima do app</span>
            <input
              className="field-input"
              name="minAppVersion"
              placeholder="1.0.1"
              required
            />
            <span className="text-xs text-muted">
              Semver. Exija só depois do binário novo estar na loja.
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">URL Play Store</span>
              <input
                className="field-input"
                name="androidStoreUrl"
                placeholder="https://play.google.com/store/apps/details?id=..."
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">URL App Store</span>
              <input
                className="field-input"
                name="iosStoreUrl"
                placeholder="https://apps.apple.com/app/id..."
              />
            </label>
          </div>
        </>
      ) : (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">OTA mínima (constante)</span>
          <input
            className="field-input"
            inputMode="numeric"
            name="minOtaVersion"
            placeholder="1"
            required
          />
          <span className="text-xs text-muted">
            Compare com <code>OTA_VERSION</code> no app. Suba a const antes do{" "}
            <code>eas update</code>.
          </span>
        </label>
      )}

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Mensagem</span>
        <textarea
          className="field-input min-h-24"
          name="message"
          placeholder={
            kind === "store" ? DEFAULT_STORE_MESSAGE : DEFAULT_OTA_MESSAGE
          }
        />
      </label>

      <button className="btn-primary" disabled={pending} type="submit">
        {pending ? "Adicionando..." : "Adicionar bloqueio"}
      </button>
    </form>
  );
}

function KindButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? "btn-primary-sm" : "btn-secondary"}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
