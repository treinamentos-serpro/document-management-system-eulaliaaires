// Middleware de rate limiting simples baseado em IP, sem dependências externas.
// Limita o número de requisições por IP dentro de uma janela de tempo.

/**
 * Cria um middleware de rate limiting.
 * @param {{ windowMs: number, max: number }} options
 */
function rateLimiter({ windowMs = 60_000, max = 60 } = {}) {
  // ip -> { count, resetAt }
  const hits = new Map();

  return function limit(req, res, next) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || now > entry.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      return res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' });
    }

    entry.count += 1;
    next();
  };
}

module.exports = { rateLimiter };
