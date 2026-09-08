import {
  faro,
  getWebInstrumentations,
  initializeFaro,
  type Faro,
} from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

let initialized = false;

export function initFaro(): Faro | null {
  if (typeof window === "undefined") {
    return null;
  }

  const url =
    process.env.NEXT_PUBLIC_FARO_URL?.trim() ||
    "https://faro-collector-prod-sa-east-1.grafana.net/collect/752df75db1aa84d875fb04cf7440567b";
  if (!url) {
    return null;
  }

  if (initialized) {
    return faro;
  }

  initializeFaro({
    app: {
      name: process.env.NEXT_PUBLIC_FARO_APP_NAME ?? "adm-confraria",
      namespace: process.env.NEXT_PUBLIC_FARO_APP_NAMESPACE ?? "confraria",
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
    },
    instrumentations: [
      ...getWebInstrumentations(),
      new TracingInstrumentation(),
    ],
    url,
  });

  initialized = true;
  return faro;
}

export function getFaro(): Faro | null {
  if (typeof window === "undefined" || !initialized) {
    return null;
  }
  return faro;
}

export { LogLevel } from "@grafana/faro-web-sdk";
