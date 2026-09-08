"use client";

import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  cancelEventAction,
  restoreEventAction,
  updateEventAction,
  type ActionResult,
} from "@/lib/events-actions";
import { parseBrazilDateTime } from "@/lib/event-period";
import { useActionToast } from "@/lib/use-action-toast";

type EventEditFormProps = {
  categories: { id: string; name: string }[];
  event: {
    cancellation_reason: string | null;
    category: string;
    description: string | null;
    end_date: string;
    end_time: string;
    id: string;
    included: string[];
    is_deleted: boolean;
    participant_limit: number | null;
    requirements: string[];
    start_date: string;
    start_time: string;
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
  const [startDate, setStartDate] = useState(event.start_date);
  const [endDate, setEndDate] = useState(event.end_date);
  const [clientError, setClientError] = useState<string | null>(null);

  useActionToast(state, {
    logAction: "event edit",
    logAttrs: { eventId: event.id },
  });
  useActionToast(cancelState, {
    logAction: "event cancel",
    logAttrs: { eventId: event.id },
  });

  function handleStartDateChange(value: string) {
    setStartDate(value);
    setEndDate((current) => {
      if (!current || current === startDate) {
        return value;
      }
      return current;
    });
  }

  function handleSubmit(formData: FormData) {
    setClientError(null);

    const start = String(formData.get("start_date") ?? "").trim();
    const end = String(formData.get("end_date") ?? "").trim();
    const startTime = String(formData.get("start_time") ?? "").trim();
    const endTime = String(formData.get("end_time") ?? "").trim();

    if (!startTime || !endTime) {
      setClientError("Horário de início e término são obrigatórios");
      return;
    }

    const startsAt = parseBrazilDateTime(start, startTime);
    const endsAt = parseBrazilDateTime(end, endTime);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      setClientError("Datas ou horários inválidos");
      return;
    }

    if (endsAt.getTime() <= startsAt.getTime()) {
      setClientError("O término deve ser posterior ao início");
      return;
    }

    return formAction(formData);
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="panel-card space-y-4 p-5 sm:p-6">
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

          <div className="hidden sm:block" />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Data de início</span>
            <input
              className="field-input"
              name="start_date"
              onChange={(eventInput) =>
                handleStartDateChange(eventInput.target.value)
              }
              required
              type="date"
              value={startDate}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Data de término</span>
            <input
              className="field-input"
              name="end_date"
              onChange={(eventInput) => setEndDate(eventInput.target.value)}
              required
              type="date"
              value={endDate}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Início</span>
            <input
              className="field-input"
              defaultValue={event.start_time}
              name="start_time"
              required
              type="time"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Fim</span>
            <input
              className="field-input"
              defaultValue={event.end_time}
              name="end_time"
              required
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

        {clientError || state.error ? (
          <p className="text-sm text-danger">{clientError ?? state.error}</p>
        ) : null}

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
