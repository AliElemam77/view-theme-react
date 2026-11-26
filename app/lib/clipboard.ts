/** Copies `value` to the clipboard using the async API with a temporary input fallback. */
export function copyToClipboard(value: string, onDone?: () => void): void {
  const fallback = () => {
    const aux = document.createElement('input');
    aux.value = value;
    document.body.appendChild(aux);
    aux.select();
    try {
      document.execCommand('copy');
    } finally {
      aux.remove();
    }
  };

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(value).then(
      () => onDone?.(),
      () => {
        fallback();
        onDone?.();
      }
    );
    return;
  }

  fallback();
  onDone?.();
}
