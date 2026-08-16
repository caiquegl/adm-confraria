export const VERSION_CHANNELS = ["production", "preview"] as const;

export type VersionChannel = (typeof VERSION_CHANNELS)[number];

export const VERSION_BLOCK_KINDS = ["store", "ota"] as const;

export type VersionBlockKind = (typeof VERSION_BLOCK_KINDS)[number];

export type VersionPolicyActionResult = {
  at?: number;
  error?: string;
  success?: string;
};

export type VersionBlockRow = {
  androidStoreUrl: string | null;
  createdAt: string;
  id: string;
  iosStoreUrl: string | null;
  kind: VersionBlockKind;
  message: string | null;
  minAppVersion: string | null;
  minOtaVersion: number | null;
};

export function isVersionBlockKind(
  value: string | null | undefined,
): value is VersionBlockKind {
  return VERSION_BLOCK_KINDS.includes(value as VersionBlockKind);
}
