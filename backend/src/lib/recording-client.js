/**
 * Panggil API recording-ternak (sumber data users & Farmer/Peternak yang digabung).
 * - `token`: JWT user yang sedang login, diteruskan agar auth check di recording-ternak tetap berlaku.
 * - Semua request membawa header x-internal-key agar recording-ternak tahu request ini dari dashboard.
 */
async function recordingFetch(path, { method = 'GET', body, token } = {}) {
  if (!process.env.RECORDING_TERNAK_API_URL) {
    throw new Error('RECORDING_TERNAK_API_URL belum diset.');
  }

  const headers = {
    'x-internal-key': process.env.INTERNAL_API_KEY || '',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${process.env.RECORDING_TERNAK_API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const message = payload?.message || `Recording Ternak API error (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

module.exports = { recordingFetch };
