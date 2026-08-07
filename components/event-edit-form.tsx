"use client";

import { useActionState, useTransition } from "react";
import { toast } from "sonner";

import {
  cancelEventAction,
  restoreEventAction,
  updateEventAction,
  type ActionResult,
} from "@/lib/events-actions";
import { useActionToast } from "@/lib/use-action-toast";

type EventEditFormProps = {
  categories: { id: string; name: string }[];
  event: {
    cancellation_reason: string | null;
    category: string;
    date: string;
    description: string | null;
    end_time: string | null;
    id: string;
    included: string[];
    is_deleted: boolean;
    participant_limit: number | null;
    requirements: string[];
    start_time: string | null;
    title: string;
  };
};

const initial: ActionResult = {};

export function EventEditForm({ categories, event }: EventEditFormProps) {
  const [state, formAction, pending] = useActionState(updateEventAction, initial);
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelEventAction,
    initial,
  );
  const [restorePending, startRestore] = useTransition();

  useActionToast(state);
  useActionToast(cancelState);

  return (
    <div className="space-y-6">
      <form action={formAction} className="panel-card space-y-4 p-5 sm:p-6">
        <input name="eventId" type="hidden" value={event.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Título</span>
            <input
              className="field-input"
              defaultValue={event.title}
              name="title"
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Categoria</span>
            <select
              className="field-input"
              defaultValue={event.category}
              name="category"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
              {!categories.some((c) => c.name === event.category) ? (
                <option value={event.category}>{event.category}</option>
              ) : null}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Data</span>
            <input
              className="field-input"
              defaultValue={event.date}
              name="date"
              required
              type="date"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Início</span>
            <input
              className="field-input"
              defaultValue={event.start_time ?? ""}
              name="start_time"
              type="time"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Fim</span>
            <input
              className="field-input"
              defaultValue={event.end_time ?? ""}
              name="end_time"
              type="time"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Limite de participantes</span>
            <input
              className="field-input"
              defaultValue={event.participant_limit ?? ""}
              min={1}
              name="participant_limit"
              type="number"
            />
          </label>

          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Descrição</span>
            <textarea
              className="field-input"
              defaultValue={event.description ?? ""}
              name="description"
              rows={3}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Incluído (1 por linha)</span>
            <textarea
              className="field-input"
              defaultValue={event.included.join("\n")}
              name="included"
              rows={3}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Requisitos (1 por linha)</span>
            <textarea
              className="field-input"
              defaultValue={event.requirements.join("\n")}
              name="requirements"
              rows={3}
            />
          </label>
        </div>

        <button className="btn-primary" disabled={pending} type="submit">
          {pending ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      <div className="panel-card p-5 sm:p-6">
        {event.is_deleted ? (
          <div className="space-y-3">
            <p className="text-sm text-danger">
              Evento cancelado
              {event.cancellation_reason
                ? `: ${event.cancellation_reason}`
                : "."}
            </p>
            <button
              className="rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent disabled:opacity-60"
              disabled={restorePending}
              onClick={() => {
                startRestore(async () => {
                  const result = await restoreEventAction(event.id);
                  if (result.success) {
                    toast.success(result.success);
                  } else if (result.error) {
                    toast.error(result.error);
                  }
                });
              }}
              type="button"
            >
              Restaurar evento
            </button>
          </div>
        ) : (
          <form action={cancelAction} className="space-y-3">
            <input name="eventId" type="hidden" value={event.id} />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Motivo do cancelamento</span>
              <input
                className="field-input"
                name="cancellation_reason"
                required
              />
            </label>
            <button
              className="rounded-xl border border-danger px-4 py-2 text-sm font-medium text-danger disabled:opacity-60"
              disabled={cancelPending}
              type="submit"
            >
              {cancelPending ? "Cancelando..." : "Cancelar evento"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
