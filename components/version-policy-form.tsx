"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { useActionToast } from "@/lib/use-action-toast";
import { updateVersionPolicyAction } from "@/lib/version-policy-actions";
import {
  VERSION_CHANNELS,
  type VersionChannel,
  type VersionPolicyActionResult,
} from "@/lib/version-policy";

const DEFAULT_STORE_MESSAGE =
  "Há uma nova versão do Confraria. Atualize na loja para continuar.";
const DEFAULT_OTA_MESSAGE =
  "Há uma atualização pronta. Feche o app e abra novamente para instalar automaticamente.";

const initial: VersionPolicyActionResult = {};

type VersionPolicyFormProps = {
  channel: VersionChannel;
  policy: {
    androidStoreUrl: string;
    iosStoreUrl: string;
    messageOta: string;
    messageStore: string;
    minAppVersion: string;
    minOtaVersion: string;
  };
};

export function VersionPolicyForm({ channel, policy }: VersionPolicyFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateVersionPolicyAction,
    initial,
  );

  useActionToast(state);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {VERSION_CHANNELS.map((item) => (
          <button
            className={item === channel ? "btn-primary-sm" : "btn-secondary"}
            key={item}
            onClick={() => router.push(`/versoes?channel=${item}`)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <form action={formAction} className="panel-card space-y-4 p-5 sm:p-6">
        <input name="channel" type="hidden" value={channel} />

        <p className="text-sm text-muted">
          Canal <span className="font-semibold text-foreground">{channel}</span>.
          Campos vazios desligam a exigência correspondente.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Versão mínima do app</span>
            <input
              className="field-input"
              defaultValue={policy.minAppVersion}
              name="minAppVersion"
              placeholder="1.0.1"
            />
            <span className="text-xs text-muted">
              Semver. Exija só depois do binário novo estar na loja.
            </span>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">OTA mínima (constante)</span>
            <input
              className="field-input"
              defaultValue={policy.minOtaVersion}
              inputMode="numeric"
              name="minOtaVersion"
              placeholder="1"
            />
            <span className="text-xs text-muted">
              Compare com <code>OTA_VERSION</code> no app. Suba a const antes do{" "}
              <code>eas update</code>.
            </span>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">URL Play Store</span>
            <input
              className="field-input"
              defaultValue={policy.androidStoreUrl}
              name="androidStoreUrl"
              placeholder="https://play.google.com/store/apps/details?id=..."
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">URL App Store</span>
            <input
              className="field-input"
              defaultValue={policy.iosStoreUrl}
              name="iosStoreUrl"
              placeholder="https://apps.apple.com/app/id..."
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Mensagem da loja</span>
          <textarea
            className="field-input min-h-24"
            defaultValue={policy.messageStore}
            name="messageStore"
            placeholder={DEFAULT_STORE_MESSAGE}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Mensagem do EAS Update</span>
          <textarea
            className="field-input min-h-24"
            defaultValue={policy.messageOta}
            name="messageOta"
            placeholder={DEFAULT_OTA_MESSAGE}
          />
        </label>

        <button className="btn-primary" disabled={pending} type="submit">
          {pending ? "Salvando..." : "Salvar política"}
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        <PreviewCard
          body={policy.messageStore || DEFAULT_STORE_MESSAGE}
          title="Preview — loja"
        />
        <PreviewCard
          body={policy.messageOta || DEFAULT_OTA_MESSAGE}
          title="Preview — EAS Update"
        />
      </div>
    </div>
  );
}

function PreviewCard({ body, title }: { body: string; title: string }) {
  return (
    <div className="panel-card space-y-2 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <p className="text-sm text-foreground">{body}</p>
    </div>
  );
}
