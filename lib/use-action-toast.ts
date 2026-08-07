"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ActionResult = {
  at?: number;
  error?: string;
  success?: string;
};

export function useActionToast(result: ActionResult | undefined) {
  const lastAt = useRef<number | null>(null);

  useEffect(() => {
    if (!result?.success && !result?.error) {
      return;
    }

    if (result.at != null && lastAt.current === result.at) {
      return;
    }

    lastAt.current = result.at ?? Date.now();

    if (result.success) {
      toast.success(result.success);
      return;
    }

    if (result.error) {
      toast.error(result.error);
    }
  }, [result]);
}
