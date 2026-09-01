// Repositório de documentos: persiste metadados em memória e
// delega leitura/escrita de arquivos ao filesystem local (backend/storage).

const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const STORAGE_DIR = path.resolve(__dirname, '../../storage');

// Garante que o diretório de armazenamento existe.
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Mapa em memória: id -> metadados do documento.
const documents = new Map();

/**
 * Salva os metadados de um arquivo recém-enviado.
 * @param {{ originalname: string, size: number, filename: string }} file
 * @param {string} owner
 * @returns {{ id: string, name: string, size: number, uploadedAt: string, owner: string, filename: string }}
 */
function save(file, owner) {
  const doc = {
    id: randomUUID(),
    name: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    filename: file.filename,
  };
  documents.set(doc.id, doc);
  return doc;
}

/**
 * Retorna todos os documentos armazenados.
 * @returns {Array}
 */
function findAll() {
  return Array.from(documents.values());
}

/**
 * Retorna um documento pelo id ou undefined.
 * @param {string} id
 * @returns {object|undefined}
 */
function findById(id) {
  return documents.get(id);
}

/**
 * Retorna o caminho absoluto do arquivo no storage, garantindo que
 * o caminho resultante não escapa do diretório de armazenamento.
 * @param {string} filename
 * @returns {string}
 */
function resolveFilePath(filename) {
  const filePath = path.resolve(STORAGE_DIR, filename);
  if (!filePath.startsWith(STORAGE_DIR + path.sep)) {
    throw Object.assign(new Error('Caminho de arquivo inválido.'), { statusCode: 400 });
  }
  return filePath;
}

/**
 * Remove todos os documentos da memória. Útil para isolamento de testes.
 */
function reset() {
  documents.clear();
}

module.exports = { save, findAll, findById, resolveFilePath, reset };
