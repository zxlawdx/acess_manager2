function parseResponseBody(text) {
  if (!text) return {};
  try { return JSON.parse(text); }
  catch (_) { return {raw: text}; }
}

export async function request(path, options = {}) {
  const url = new URL(path, window.location.origin);
  const res = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  const data = parseResponseBody(text);

  if (!res.ok) {
    const message = data?.error?.message || data?.message || `HTTP ${res.status} ao acessar ${url.pathname}`;
    throw new Error(message);
  }
  if (data?.success === false) {
    throw new Error(data?.error?.message || 'Falha na operação');
  }
  return data;
}
