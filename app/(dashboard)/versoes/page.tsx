import Link from "next/link";

import { VersionBlockForm } from "@/components/version-block-form";
import { VersionBlockList } from "@/components/version-block-list";
import { prisma } from "@/lib/prisma";
import {
  VERSION_CHANNELS,
  isVersionBlockKind,
  type VersionBlockKind,
  type VersionChannel,
} from "@/lib/version-policy";

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

  const rows = await prisma.appVersionBlock.findMany({
    orderBy: { created_at: "desc" },
    where: { channel },
  });

  const blocks = rows.flatMap((row) => {
    const kind: VersionBlockKind | null = isVersionBlockKind(row.kind)
      ? row.kind
      : null;
    if (!kind) return [];
    return [
      {
        androidStoreUrl: row.android_store_url,
        createdAt: row.created_at.toLocaleString("pt-BR"),
        id: row.id,
        iosStoreUrl: row.ios_store_url,
        kind,
        message: row.message,
        minAppVersion: row.min_app_version,
        minOtaVersion: row.min_ota_version,
      },
    ];
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Versões</h1>
        <p className="page-subtitle">
          Bloqueie o app até o usuário atualizar na loja ou aplicar um EAS
          Update. Remova um item da lista para desfazer aquele bloqueio.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {VERSION_CHANNELS.map((item) => (
          <Link
            className={item === channel ? "btn-primary-sm" : "btn-secondary"}
            href={`/versoes?channel=${item}`}
            key={item}
          >
            {item}
          </Link>
        ))}
      </div>

      <VersionBlockList blocks={blocks} />
      <VersionBlockForm channel={channel} />
    </div>
  );
}
