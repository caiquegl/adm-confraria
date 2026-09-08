type Attrs = Record<string, unknown>;

function toContext(attrs?: Attrs): Record<string, string> | undefined {
  if (!attrs) {
    return undefined;
  }

  const context: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue;
    context[key] = typeof value === "string" ? value : JSON.stringify(value);
  }
  return Object.keys(context).length > 0 ? context : undefined;
}

function push(
  level: "info" | "warn" | "error",
  message: string,
  attrs?: Attrs,
) {
  if (attrs) {
    console[level](`[adm] ${message}`, attrs);
  } else {
    console[level](`[adm] ${message}`);
  }

  if (typeof window === "undefined") {
    return;
  }

  void import("@/lib/faro")
    .then(({ getFaro, LogLevel }) => {
      const instance = getFaro();
      if (!instance) {
        return;
      }

      const faroLevel =
        level === "error"
          ? LogLevel.ERROR
          : level === "warn"
            ? LogLevel.WARN
            : LogLevel.INFO;

      instance.api.pushLog([message], {
        context: toContext(attrs),
        level: faroLevel,
      });
    })
    .catch(() => {
      // Faro is optional; never break the app for telemetry.
    });
}

export const admLog = {
  info(message: string, attrs?: Attrs) {
    push("info", message, attrs);
  },
  warn(message: string, attrs?: Attrs) {
    push("warn", message, attrs);
  },
  error(message: string, attrs?: Attrs) {
    push("error", message, attrs);
  },
};
