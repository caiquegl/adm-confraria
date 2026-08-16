import Link from "next/link";
import { notFound } from "next/navigation";

import { VersionBlockForm } from "@/components/version-block-form";
import { prisma } from "@/lib/prisma";
import {
  VERSION_CHANNELS,
  isVersionBlockKind,
  type VersionChannel,
} from "@/lib/version-policy";

type Params = Promise<{ id: string }>;

export default async function VersaoDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const row = await prisma.appVersionBlock.findUnique({ where: { id } });

  if (!row || !isVersionBlockKind(row.kind)) {
    notFound();
  }

  if (!VERSION_CHANNELS.includes(row.channel as VersionChannel)) {
    notFound();
  }

  const channel = row.channel as VersionChannel;

  return (
    <div className="space-y-6">
      <div>
        <Link
          className="text-sm text-accent hover:underline"
          href={`/versoes?channel=${channel}`}
        >
          ← Voltar
        </Link>
        <h1 className="page-title mt-2">Editar bloqueio</h1>
        <p className="page-subtitle">
          Canal {channel} · {row.kind === "store" ? "Loja" : "EAS Update"}
        </p>
      </div>

      <VersionBlockForm
        block={{
          androidStoreUrl: row.android_store_url,
          createdAt: row.created_at.toLocaleString("pt-BR"),
          id: row.id,
          iosStoreUrl: row.ios_store_url,
          kind: row.kind,
          message: row.message,
          minAppVersion: row.min_app_version,
          minOtaVersion: row.min_ota_version,
        }}
        channel={channel}
      />
    </div>
  );
}
