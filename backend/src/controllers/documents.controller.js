const { unlink } = require('node:fs/promises');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class DocumentsController {
  constructor(documentsService) {
    this.documentsService = documentsService;
    this.upload = this.upload.bind(this);
    this.list = this.list.bind(this);
    this.download = this.download.bind(this);
  }

  async upload(req, res) {
    const owner = this.getOwner(req, res);

    if (!owner) {
      await this.removeUploadedFile(req.file);
      return;
    }

    if (!req.file) {
      this.sendError(res, 400, 'FILE_REQUIRED', 'O arquivo é obrigatório.');
      return;
    }

    try {
      const document = this.documentsService.createDocument(req.file, owner);
      res.status(201).json(document);
    } catch (error) {
      await this.removeUploadedFile(req.file);
      this.sendKnownError(res, error, 'UPLOAD_FAILED', 'Não foi possível enviar o documento.');
    }
  }

  list(req, res) {
    const owner = this.getOwner(req, res);

    if (!owner) {
      return;
    }

    try {
      res.json(this.documentsService.listDocuments(owner));
    } catch (error) {
      this.sendKnownError(
        res,
        error,
        'DOCUMENT_LIST_FAILED',
        'Não foi possível listar os documentos.',
      );
    }
  }

  download(req, res, next) {
    const owner = this.getOwner(req, res);

    if (!owner) {
      return;
    }

    if (!UUID_PATTERN.test(req.params.id)) {
      this.sendError(res, 400, 'INVALID_DOCUMENT_ID', 'Identificador de documento inválido.');
      return;
    }

    try {
      const document = this.documentsService.getDocumentForDownload(req.params.id, owner);
      res.type(document.mimeType || 'application/octet-stream');
      res.download(document.storagePath, document.originalName, (error) => {
        if (!error) {
          return;
        }

        if (res.headersSent) {
          next(error);
          return;
        }

        this.sendError(res, 500, 'DOWNLOAD_FAILED', 'Não foi possível baixar o documento.');
      });
    } catch (error) {
      this.sendKnownError(res, error, 'DOWNLOAD_FAILED', 'Não foi possível baixar o documento.');
    }
  }

  getOwner(req, res) {
    const header = req.get('X-User-Id');
    const owner = typeof header === 'string' ? header.trim() : '';

    if (!owner || owner.length > 128) {
      this.sendError(res, 401, 'USER_ID_REQUIRED', 'Identificação do usuário obrigatória.');
      return null;
    }

    return owner;
  }

  async removeUploadedFile(file) {
    if (!file?.path) {
      return;
    }

    try {
      await unlink(file.path);
    } catch (error) {
      console.error('Não foi possível remover o arquivo após falha no upload.', error);
    }
  }

  sendKnownError(res, error, fallbackCode, fallbackMessage) {
    this.sendError(
      res,
      error.status || 500,
      error.code || fallbackCode,
      error.status ? error.message : fallbackMessage,
    );
  }

  sendError(res, status, code, message) {
    res.status(status).json({ error: { code, message } });
  }
}

module.exports = DocumentsController;