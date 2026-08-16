"use client";

import { useActionState, useState } from "react";

import { useActionToast } from "@/lib/use-action-toast";
import {
  createVersionBlockAction,
  updateVersionBlockAction,
} from "@/lib/version-policy-actions";
import {
  type VersionBlockKind,
  type VersionBlockRow,
  type VersionChannel,
  type VersionPolicyActionResult,
} from "@/lib/version-policy";

const DEFAULT_STORE_MESSAGE =
  "Há uma nova versão do Confraria. Atualize na loja para continuar.";
const DEFAULT_OTA_MESSAGE =
  "Há uma atualização pronta. Feche o app e abra novamente para instalar automaticamente.";
const DEFAULT_MIN_APP_VERSION = "1.0.1";
const DEFAULT_MIN_OTA_VERSION = "1";
const DEFAULT_ANDROID_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.caiquegl22.appconfraria";
const DEFAULT_IOS_STORE_URL = "https://apps.apple.com/app/id...";

const initial: VersionPolicyActionResult = {};

type VersionBlockFormProps = {
  block?: VersionBlockRow;
  channel: VersionChannel;
};

export function VersionBlockForm({ block, channel }: VersionBlockFormProps) {
  const isEdit = Boolean(block);
  const [kind, setKind] = useState<VersionBlockKind>(block?.kind ?? "store");
  const [state, formAction, pending] = useActionState(
    isEdit ? updateVersionBlockAction : createVersionBlockAction,
    initial,
  );

  useActionToast(state);

  return (
    <form
      action={formAction}
      className="panel-card space-y-4 p-5 sm:p-6"
      key={isEdit ? block?.id : state.success ? state.at : "form"}
    >
      <input name="channel" type="hidden" value={channel} />
      <input name="kind" type="hidden" value={kind} />
      {block ? <input name="id" type="hidden" value={block.id} /> : null}

      <div>
        <h2 className="text-base font-semibold">
          {isEdit ? "Editar bloqueio" : "Novo bloqueio"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {isEdit
            ? "Altere a versão exigida, as URLs ou a mensagem deste bloqueio."
            : "Cada item entra na lista e pode ser editado ou removido depois. Se houver vários do mesmo tipo, o app usa o mais restritivo."}
        </p>
      </div>

      {isEdit ? (
        <p className="text-sm text-muted">
          Tipo:{" "}
          <span className="font-semibold text-foreground">
            {kind === "store" ? "Loja" : "EAS Update"}
          </span>
        </p>
      ) : (
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
      )}

      {kind === "store" ? (
        <>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Versão mínima do app</span>
            <input
              className="field-input"
              defaultValue={block?.minAppVersion || DEFAULT_MIN_APP_VERSION}
              name="minAppVersion"
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
                defaultValue={block?.androidStoreUrl || DEFAULT_ANDROID_STORE_URL}
                name="androidStoreUrl"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">URL App Store</span>
              <input
                className="field-input"
                defaultValue={block?.iosStoreUrl || DEFAULT_IOS_STORE_URL}
                name="iosStoreUrl"
              />
            </label>
          </div>
        </>
      ) : (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">OTA mínima (constante)</span>
          <input
            className="field-input"
            defaultValue={
              block?.minOtaVersion != null
                ? String(block.minOtaVersion)
                : DEFAULT_MIN_OTA_VERSION
            }
            inputMode="numeric"
            name="minOtaVersion"
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
          defaultValue={
            block?.message ||
            (kind === "store" ? DEFAULT_STORE_MESSAGE : DEFAULT_OTA_MESSAGE)
          }
          key={kind}
          name="message"
        />
      </label>

      <button className="btn-primary" disabled={pending} type="submit">
        {pending
          ? isEdit
            ? "Salvando..."
            : "Adicionando..."
          : isEdit
            ? "Salvar alterações"
            : "Adicionar bloqueio"}
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
