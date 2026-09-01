// Utilitário para criar erros HTTP com statusCode padronizado.

/**
 * Cria um Error com statusCode associado.
 * @param {string} message
 * @param {number} statusCode
 * @returns {Error}
 */
function httpError(message, statusCode) {
  return Object.assign(new Error(message), { statusCode });
}

module.exports = { httpError };
