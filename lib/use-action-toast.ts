"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { admLog } from "@/lib/adm-log";

type ActionResult = {
  at?: number;
  error?: string;
  success?: string;
};

type UseActionToastOptions = {
  logAction?: string;
  logAttrs?: Record<string, unknown>;
};

export function useActionToast(
  result: ActionResult | undefined,
  options?: UseActionToastOptions,
) {
  const lastAt = useRef<number | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!result?.success && !result?.error) {
      return;
    }

    if (result.at != null && lastAt.current === result.at) {
      return;
    }

    lastAt.current = result.at ?? Date.now();
    const current = optionsRef.current;

    if (result.success) {
      toast.success(result.success);
      if (current?.logAction) {
        admLog.info(`${current.logAction} success`, current.logAttrs);
      }
      return;
    }

    if (result.error) {
      toast.error(result.error);
      if (current?.logAction) {
        admLog.warn(`${current.logAction} failed`, {
          ...current.logAttrs,
          reason: result.error,
        });
      }
    }
  }, [result]);
}
