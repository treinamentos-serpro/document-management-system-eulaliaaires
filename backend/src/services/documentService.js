// Serviço de documentos: concentra as regras de negócio do DMS.

const repository = require('../repositories/documentRepository');
const { httpError } = require('../utils/httpError');

// --- validações ---

function assertFilePresent(file) {
  if (!file) throw httpError('Nenhum arquivo enviado.', 400);
}

function assertDocumentExists(doc) {
  if (!doc) throw httpError('Documento não encontrado.', 404);
}

// --- operações ---

/**
 * Registra um novo documento enviado.
 * @param {object} file - objeto de arquivo do multer
 * @param {string} owner - identificador do dono do documento
 * @returns {object} metadados do documento criado
 */
function upload(file, owner) {
  assertFilePresent(file);
  return repository.save(file, owner || 'anônimo');
}

/**
 * Retorna a lista de todos os documentos.
 * @returns {Array}
 */
function listAll() {
  return repository.findAll();
}

/**
 * Localiza um documento e retorna seu caminho no filesystem.
 * @param {string} id
 * @returns {{ doc: object, filePath: string }}
 */
function getFileById(id) {
  const doc = repository.findById(id);
  assertDocumentExists(doc);
  const filePath = repository.resolveFilePath(doc.filename);
  return { doc, filePath };
}

module.exports = { upload, listAll, getFileById };
