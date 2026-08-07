"use client";

import { useActionState } from "react";

import { EventImageFields } from "@/components/event-image-fields";
import { EventPlacesFields } from "@/components/event-places-fields";
import {
  createEventViaApiAction,
  type ActionResult,
} from "@/lib/events-actions";
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

  useActionToast(state);

  return (
    <form action={formAction} className="space-y-5" encType="multipart/form-data">
      <section className="panel-card space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="section-title">Informações básicas</h2>
          <p className="text-xs text-muted">Título, categoria e horários</p>
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

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Data</span>
            <input className="field-input" name="date" required type="date" />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Início</span>
            <input className="field-input" name="startTime" type="time" />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Fim</span>
            <input className="field-input" name="endTime" type="time" />
          </label>
        </div>
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
