const INVALID_MEDIA_VALUES = new Set(["", "string", "null", "undefined", "n/a", "-"]);

export const normalizeMediaUrl = (value: string | null | undefined): string => {
  const trimmed = (value ?? "").trim();

  if (INVALID_MEDIA_VALUES.has(trimmed.toLowerCase())) {
    return "";
  }

  return trimmed;
};

export const hasMediaUrl = (value: string | null | undefined): boolean =>
  normalizeMediaUrl(value).length > 0;
