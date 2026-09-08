<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Observabilidade (Grafana + Sentry)

Ao diagnosticar problemas no ADM (produção Vercel), use **Sentry e Grafana em paralelo**.

| Ferramenta | Papel |
|---|---|
| **Sentry** | Exceptions / erros de runtime |
| **Grafana Faro → Loki** | Ações do admin (`admLog`) — login, CRUD, erros de nestFetch |

- Código: `lib/faro.ts`, `lib/adm-log.ts`, `components/faro-provider.tsx`
- Loki: `{service_name="adm-confraria"}`
- Ex.: `{service_name="adm-confraria"} |= "version.block"`
- Sem PII sensível (sem tokens / senhas); preferir ids e status

Se o MCP Grafana Cloud estiver autenticado, use `query_loki_logs` (datasource `grafanacloud-logs`) junto com o Sentry na análise.
