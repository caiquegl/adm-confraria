"use client";

import { useEffect, useState } from "react";

import type { EventPlaceReference } from "@/lib/places";

type PlaceAutocompleteProps = {
  label: string;
  name?: string;
  onChange?: (value: EventPlaceReference | null) => void;
  required?: boolean;
  value?: EventPlaceReference | null;
};

export function PlaceAutocomplete({
  label,
  name,
  onChange,
  required,
  value,
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(value?.description ?? "");
  const [selected, setSelected] = useState<EventPlaceReference | null>(
    value ?? null,
  );
  const [options, setOptions] = useState<EventPlaceReference[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelected(value ?? null);
    setQuery(value?.description ?? "");
  }, [value]);

  useEffect(() => {
    if (selected || query.trim().length < 3) {
      setOptions([]);
      return;
    }

    const handle = window.setTimeout(async () => {
      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(query.trim())}`,
      );
      if (!response.ok) {
        setOptions([]);
        return;
      }
      const data = (await response.json()) as EventPlaceReference[];
      setOptions(
        data.map((item) => ({
          ...item,
          secondaryText: item.secondaryText ?? "",
          types: item.types ?? [],
        })),
      );
      setOpen(true);
    }, 450);

    return () => window.clearTimeout(handle);
  }, [query, selected]);

  function selectPlace(option: EventPlaceReference) {
    const normalized: EventPlaceReference = {
      description: option.description,
      mainText: option.mainText,
      placeId: option.placeId,
      reference: option.reference || option.placeId,
      secondaryText: option.secondaryText ?? "",
      types: option.types ?? [],
    };
    setSelected(normalized);
    setQuery(normalized.description);
    setOpen(false);
    onChange?.(normalized);
  }

  function clearPlace(nextQuery: string) {
    setSelected(null);
    setQuery(nextQuery);
    onChange?.(null);
  }

  return (
    <div className="relative space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="field-input"
        onChange={(event) => clearPlace(event.target.value)}
        onFocus={() => {
          if (options.length) {
            setOpen(true);
          }
        }}
        placeholder="Digite para buscar..."
        required={required && !selected}
        value={selected ? selected.description : query}
      />
      {name ? (
        <input
          name={name}
          type="hidden"
          value={selected ? JSON.stringify(selected) : ""}
        />
      ) : null}

      {open && options.length > 0 ? (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-white shadow-lg">
          {options.map((option) => (
            <li key={option.placeId}>
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                onClick={() => selectPlace(option)}
                type="button"
              >
                <div className="font-medium">{option.mainText}</div>
                {option.secondaryText ? (
                  <div className="text-xs text-muted">{option.secondaryText}</div>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
