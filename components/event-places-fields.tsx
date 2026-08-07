"use client";

import { useState } from "react";

import { PlaceAutocomplete } from "@/components/place-autocomplete";
import type { EventPlaceReference } from "@/lib/places";

/**
 * Espelha o step 2 do app:
 * - location (Ponto de encontro) → role origin no backend
 * - destination (opcional)
 * - stops[] (paradas opcionais)
 *
 * O objeto enviado é o do autocomplete (sem lat/lng).
 * Latitude/longitude são resolvidas no Nest via Place Details.
 */
export function EventPlacesFields() {
  const [location, setLocation] = useState<EventPlaceReference | null>(null);
  const [destination, setDestination] = useState<EventPlaceReference | null>(
    null,
  );
  const [stops, setStops] = useState<(EventPlaceReference | null)[]>([]);

  return (
    <div className="space-y-4 sm:col-span-2">
      <PlaceAutocomplete
        label="Ponto de encontro *"
        name="locationJson"
        onChange={setLocation}
        required
        value={location}
      />

      <PlaceAutocomplete
        label="Destino (opcional)"
        name="destinationJson"
        onChange={setDestination}
        value={destination}
      />

      <input
        name="stopsJson"
        type="hidden"
        value={JSON.stringify(stops.filter((stop) => stop !== null))}
      />

      {stops.map((stop, index) => (
        <div className="flex items-start gap-2" key={`stop-${index}`}>
          <div className="flex-1">
            <PlaceAutocomplete
              label={`Parada ${index + 1}`}
              onChange={(value) => {
                setStops((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? value : item,
                  ),
                );
              }}
              value={stop}
            />
          </div>
          <button
            className="btn-secondary mt-7"
            onClick={() => {
              setStops((current) =>
                current.filter((_, itemIndex) => itemIndex !== index),
              );
            }}
            type="button"
          >
            Remover
          </button>
        </div>
      ))}

      <button
        className="btn-secondary"
        onClick={() => setStops((current) => [...current, null])}
        type="button"
      >
        Adicionar ponto de parada (opcional)
      </button>

      <p className="text-xs text-muted">
        Locais usam o mesmo objeto do app (placeId, description, mainText…).
        Latitude e longitude são preenchidas pela API com Google Place Details.
      </p>
    </div>
  );
}
