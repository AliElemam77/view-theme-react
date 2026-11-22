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

/** Coerces a boolean-like setting (boolean, 'true'/'false', 1/0) into a boolean. */
export function booleanValue(value: unknown, defaultValue = false): boolean {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    if (s === 'true' || s === '1') return true;
    if (s === 'false' || s === '0') return false;
  }
  return defaultValue;
}

