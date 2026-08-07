/** Mesmo shape do app (`EventPlaceReference` / `PlaceReference`). */
export type EventPlaceReference = {
  description: string;
  mainText: string;
  placeId: string;
  reference: string;
  secondaryText: string;
  types: string[];
};

export function normalizePlaceReference(value: unknown): EventPlaceReference {
  const place = value as Partial<EventPlaceReference>;
  if (
    typeof place?.description !== "string" ||
    typeof place?.mainText !== "string" ||
    typeof place?.placeId !== "string" ||
    typeof place?.reference !== "string"
  ) {
    throw new Error("Local inválido");
  }

  return {
    description: place.description,
    mainText: place.mainText,
    placeId: place.placeId,
    reference: place.reference,
    secondaryText:
      typeof place.secondaryText === "string" ? place.secondaryText : "",
    types: Array.isArray(place.types)
      ? place.types.filter((item): item is string => typeof item === "string")
      : [],
  };
}
