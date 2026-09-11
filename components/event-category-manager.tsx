"use client";

import { useActionState, useState } from "react";

import {
  createEventCategoryAction,
  setEventCategoryActiveAction,
  updateEventCategoryAction,
  type CategoryActionResult,
} from "@/lib/event-category-actions";
import { useActionToast } from "@/lib/use-action-toast";

const initial: CategoryActionResult = {};

export type EventCategoryRow = {
  id: string;
  isActive: boolean;
  name: string;
  updatedAt: string;
};

function CategoryCreateForm() {
  const [state, formAction, pending] = useActionState(
    createEventCategoryAction,
    initial,
  );
  useActionToast(state, { logAction: "event.category.create" });

  return (
    <form
      action={formAction}
      className="panel-card space-y-4 p-5 sm:p-6"
      key={state.success ? state.at : "create"}
    >
      <div>
        <h2 className="section-title">Nova categoria</h2>
        <p className="text-xs text-muted">
          Aparece nos filtros e no cadastro de eventos do app
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1 space-y-1.5">
          <span className="text-sm font-medium">Nome</span>
          <input
            className="field-input"
            name="name"
            placeholder="Ex.: Encontro"
            required
          />
        </label>
        <button className="btn-primary" disabled={pending} type="submit">
          {pending ? "Criando..." : "Criar"}
        </button>
      </div>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
    </form>
  );
}

function CategoryRow({ category }: { category: EventCategoryRow }) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updatePending] = useActionState(
    updateEventCategoryAction,
    initial,
  );
  const [toggleState, toggleAction, togglePending] = useActionState(
    setEventCategoryActiveAction,
    initial,
  );

  useActionToast(updateState, {
    logAction: "event.category.update",
    logAttrs: { categoryId: category.id },
  });
  useActionToast(toggleState, {
    logAction: "event.category.toggle",
    logAttrs: { categoryId: category.id },
  });

  return (
    <li className="rounded-xl border border-border bg-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-brand-dark">{category.name}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                category.isActive
                  ? "bg-accent-soft text-brand-primary"
                  : "bg-brand-gray text-muted"
              }`}
            >
              {category.isActive ? "Ativa" : "Inativa"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Atualizada em {category.updatedAt}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary"
            onClick={() => setEditing((current) => !current)}
            type="button"
          >
            {editing ? "Fechar" : "Editar"}
          </button>
          <form action={toggleAction}>
            <input name="id" type="hidden" value={category.id} />
            <input
              name="isActive"
              type="hidden"
              value={category.isActive ? "false" : "true"}
            />
            <button className="btn-secondary" disabled={togglePending} type="submit">
              {togglePending
                ? "Salvando..."
                : category.isActive
                  ? "Inativar"
                  : "Reativar"}
            </button>
          </form>
        </div>
      </div>

      {editing ? (
        <form action={updateAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <input name="id" type="hidden" value={category.id} />
          <label className="block flex-1 space-y-1.5">
            <span className="text-sm font-medium">Novo nome</span>
            <input
              className="field-input"
              defaultValue={category.name}
              name="name"
              required
            />
          </label>
          <button className="btn-primary" disabled={updatePending} type="submit">
            {updatePending ? "Salvando..." : "Salvar"}
          </button>
        </form>
      ) : null}

      {updateState.error || toggleState.error ? (
        <p className="mt-3 text-sm text-danger">
          {updateState.error ?? toggleState.error}
        </p>
      ) : null}
    </li>
  );
}

export function EventCategoryManager({
  categories,
}: {
  categories: EventCategoryRow[];
}) {
  return (
    <div className="space-y-6">
      <CategoryCreateForm />
      <section className="space-y-3">
        <div>
          <h2 className="section-title">Categorias</h2>
          <p className="text-xs text-muted">
            Inativas deixam de aparecer nos filtros do app
          </p>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma categoria cadastrada.</p>
        ) : (
          <ul className="space-y-3">
            {categories.map((category) => (
              <CategoryRow category={category} key={category.id} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
