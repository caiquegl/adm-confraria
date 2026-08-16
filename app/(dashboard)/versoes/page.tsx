import { VersionPolicyForm } from "@/components/version-policy-form";
import { prisma } from "@/lib/prisma";
import { VERSION_CHANNELS, type VersionChannel } from "@/lib/version-policy";

type SearchParams = Promise<{ channel?: string }>;

function isVersionChannel(value: string | undefined): value is VersionChannel {
  return VERSION_CHANNELS.includes(value as VersionChannel);
}

export default async function VersoesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const channel: VersionChannel = isVersionChannel(params.channel)
    ? params.channel
    : "production";

  const policy = await prisma.appVersionPolicy.findUnique({
    where: { channel },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Versões</h1>
        <p className="page-subtitle">
          Bloqueie o app até o usuário atualizar na loja ou aplicar um EAS
          Update.
        </p>
      </div>

      <VersionPolicyForm
        channel={channel}
        policy={{
          androidStoreUrl: policy?.android_store_url ?? "",
          iosStoreUrl: policy?.ios_store_url ?? "",
          messageOta: policy?.message_ota ?? "",
          messageStore: policy?.message_store ?? "",
          minAppVersion: policy?.min_app_version ?? "",
          minOtaVersion:
            policy?.min_ota_version != null ? String(policy.min_ota_version) : "",
        }}
      />
    </div>
  );
}
