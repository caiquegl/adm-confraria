"use client";

import { useEffect } from "react";

import { initFaro } from "@/lib/faro";

export function FaroProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initFaro();
  }, []);

  return children;
}
