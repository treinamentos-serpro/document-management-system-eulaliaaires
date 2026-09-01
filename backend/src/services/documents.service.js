const { randomUUID } = require('node:crypto');

class DocumentsService {
  constructor(documentsRepository) {
    this.documentsRepository = documentsRepository;
  }

  createDocument(file, owner) {
    const document = {
      id: randomUUID(),
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
      storagePath: file.path,
    };

    return this.toPublicDocument(this.documentsRepository.save(document));
  }

  listDocuments(owner) {
    return this.documentsRepository
      .findByOwner(owner)
      .map((document) => this.toPublicDocument(document));
  }

  getDocumentForDownload(id, owner) {
    const document = this.documentsRepository.findById(id);

    if (!document) {
      throw this.createError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
    }

    if (document.owner !== owner) {
      throw this.createError(403, 'DOCUMENT_ACCESS_DENIED', 'Acesso ao documento negado.');
    }

    return document;
  }

  toPublicDocument(document) {
    return {
      id: document.id,
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      uploadedAt: document.uploadedAt,
      owner: document.owner,
    };
  }

  createError(status, code, message) {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    return error;
  }
}

module.exports = DocumentsService;