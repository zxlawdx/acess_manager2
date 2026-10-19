export class ClipboardError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ClipboardError';
  }
}

export async function copyText(value) {
  const text = String(value ?? '');
  if (!text) throw new ClipboardError('Nada para copiar.');

  let response;
  try {
    response = await fetch(new URL('/api/system/clipboard', window.location.origin), {
      method: 'POST',
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({text}),
    });
  } catch (error) {
    throw new ClipboardError('Não foi possível acessar o clipboard do desktop.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.success === false) {
    throw new ClipboardError(data?.error?.message || 'Não foi possível copiar para a área de transferência.');
  }
  return true;
}
