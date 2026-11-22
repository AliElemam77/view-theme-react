/**
 * A `dropdown-list` setting's chosen value. The engine passes the picked option, a
 * list of picked options, or the bare value, depending on where the value came from.
 */
export function optionValue(value: unknown): string {
  if (Array.isArray(value)) return optionValue(value[0]);
  if (value && typeof value === 'object') {
    const option = value as { value?: unknown; key?: unknown };
    return optionValue(option.value ?? option.key);
  }
  return value === null || value === undefined ? '' : String(value);
}

/** A `variable-list` (link picker) setting's URL: a plain string or an object carrying `url`. */
export function linkUrl(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (value && typeof value === 'object') return linkUrl((value as { url?: unknown }).url);
  return undefined;
}
