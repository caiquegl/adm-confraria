"use client";

import { useActionState, useState } from "react";

import { EventImageFields } from "@/components/event-image-fields";
import { EventPlacesFields } from "@/components/event-places-fields";
import {
  createEventViaApiAction,
  type ActionResult,
} from "@/lib/events-actions";
import { parseBrazilDateTime } from "@/lib/event-period";
import { useActionToast } from "@/lib/use-action-toast";

const initial: ActionResult = {};

type EventCreateFormProps = {
  categories: { id: string; name: string }[];
};

export function EventCreateForm({ categories }: EventCreateFormProps) {
  const [state, formAction, pending] = useActionState(
    createEventViaApiAction,
    initial,
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  useActionToast(state, { logAction: "event create" });

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

    const start = String(formData.get("startDate") ?? "").trim();
    const end = String(formData.get("endDate") ?? "").trim();
    const startTime = String(formData.get("startTime") ?? "").trim();
    const endTime = String(formData.get("endTime") ?? "").trim();

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
    <form action={handleSubmit} className="space-y-5" encType="multipart/form-data">
      <section className="panel-card space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="section-title">Informações básicas</h2>
          <p className="text-xs text-muted">Título, categoria e período</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Título</span>
            <input className="field-input" name="title" required />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Categoria</span>
            <select className="field-input" name="category" required>
              <option value="">Selecione</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <div className="hidden sm:block" />

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Data de início</span>
            <input
              className="field-input"
              name="startDate"
              onChange={(event) => handleStartDateChange(event.target.value)}
              required
              type="date"
              value={startDate}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Data de término</span>
            <input
              className="field-input"
              name="endDate"
              onChange={(event) => setEndDate(event.target.value)}
              required
              type="date"
              value={endDate}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Início</span>
            <input className="field-input" name="startTime" required type="time" />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Fim</span>
            <input className="field-input" name="endTime" required type="time" />
          </label>
        </div>

        {clientError || state.error ? (
          <p className="text-sm text-danger">{clientError ?? state.error}</p>
        ) : null}
      </section>

      <section className="panel-card space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="section-title">Localização</h2>
          <p className="text-xs text-muted">
            Mesmo fluxo do app: ponto de encontro, destino e paradas
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <EventPlacesFields />
        </div>
      </section>

      <section className="panel-card space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="section-title">Detalhes</h2>
          <p className="text-xs text-muted">Descrição, itens e limites</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Descrição</span>
            <textarea className="field-input" name="description" rows={3} />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Incluído (1 por linha)</span>
            <textarea className="field-input" name="included" rows={3} />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Requisitos (1 por linha)</span>
            <textarea className="field-input" name="requirements" rows={3} />
          </label>

          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input name="hasParticipantLimit" type="checkbox" />
            Limitar participantes
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Máx. participantes</span>
            <input
              className="field-input"
              min={1}
              name="maxParticipants"
              type="number"
            />
          </label>
        </div>
      </section>

      <section className="panel-card space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="section-title">Imagens</h2>
            <p className="text-xs text-muted">
              Arraste arquivos ou clique nas áreas abaixo · preview e remoção
              antes de enviar
            </p>
          </div>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-brand-primary">
            Capa + galeria
          </span>
        </div>
        <EventImageFields />
      </section>

      <div className="flex items-center justify-end gap-3">
        <button className="btn-primary" disabled={pending} type="submit">
          {pending ? "Criando..." : "Criar evento"}
        </button>
      </div>
    </form>
  );
}
