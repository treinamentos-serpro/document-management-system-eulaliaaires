// Cliente da API do backend. Todas as chamadas usam o prefixo /api (proxy do Vite).
const API_PREFIX = '/api';

// Headers HTTP aceitam apenas ASCII, então acentos precisam ser barrados antes do fetch.
const USER_ID_PATTERN = /^[\x20-\x7E]{1,128}$/;

function buildHeaders(userId) {
  if (!USER_ID_PATTERN.test(userId)) {
    throw new Error(
      'O identificador do usuário deve conter apenas letras sem acento, números e traços.',
    );
  }

  return { 'X-User-Id': userId };
}

async function readError(response, fallbackMessage) {
  try {
    const body = await response.json();
    return body?.error?.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function request(path, { userId, method = 'GET', body } = {}) {
  const response = await fetch(`${API_PREFIX}${path}`, {
    method,
    headers: buildHeaders(userId),
    body,
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Falha na comunicação com o servidor.'));
  }

  return response;
}

export async function uploadDocument(file, userId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', { userId, method: 'POST', body: formData });
  return response.json();
}

export async function listDocuments(userId) {
  const response = await request('/documents', { userId });
  return response.json();
}

export async function downloadDocument(id, userId) {
  const response = await request(`/documents/${id}/download`, { userId });
  return response.blob();
}
