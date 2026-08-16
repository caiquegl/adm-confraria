export const VERSION_CHANNELS = ["production", "preview"] as const;

export type VersionChannel = (typeof VERSION_CHANNELS)[number];

export type VersionPolicyActionResult = {
  at?: number;
  error?: string;
  success?: string;
};
