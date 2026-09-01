// Controller de documentos: trata entrada/saída HTTP e delega ao serviço.

const service = require('../services/documentService');

function handleError(res, err) {
  res.status(err.statusCode || 500).json({ error: err.message });
}

/**
 * POST /upload
 * Recebe um arquivo via multipart/form-data e o persiste localmente.
 */
function uploadDocument(req, res) {
  try {
    const doc = service.upload(req.file, req.body.owner);
    res.status(201).json(doc);
  } catch (err) {
    handleError(res, err);
  }
}

/**
 * GET /documents
 * Retorna a lista de documentos armazenados.
 */
function listDocuments(req, res) {
  res.json(service.listAll());
}

/**
 * GET /documents/:id/download
 * Faz o download do arquivo correspondente ao documento.
 */
function downloadDocument(req, res) {
  try {
    const { doc, filePath } = service.getFileById(req.params.id);
    res.download(filePath, doc.name);
  } catch (err) {
    handleError(res, err);
  }
}

module.exports = { uploadDocument, listDocuments, downloadDocument };
