/**
 * Uniform API response envelope.
 * success: bool
 * data: payload
 * error: string (on failure)
 * meta: { total, page, limit } for paginated responses
 */
const ok = (res, data, meta = null, status = 200) => {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
};

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, error: message });

module.exports = { ok, fail };
