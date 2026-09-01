const { mkdirSync } = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const express = require('express');
const multer = require('multer');
const DocumentsController = require('../controllers/documents.controller');
const DocumentsService = require('../services/documents.service');
const DocumentsRepository = require('../repositories/documents.repository');

const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function readPositiveInteger(value, fallback, variableName) {
  if (value === undefined) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${variableName} deve ser um número inteiro positivo.`);
  }

  return parsedValue;
}

function createDocumentsRouter(options = {}) {
  const storagePath = path.resolve(
    options.storagePath || process.env.STORAGE_PATH || path.join(__dirname, '../../storage'),
  );
  const maxFileSizeBytes = options.maxFileSizeBytes || readPositiveInteger(
    process.env.MAX_FILE_SIZE_BYTES,
    DEFAULT_MAX_FILE_SIZE_BYTES,
    'MAX_FILE_SIZE_BYTES',
  );

  mkdirSync(storagePath, { recursive: true });

  const storage = multer.diskStorage({
    destination: storagePath,
    filename(req, file, callback) {
      const extension = path.extname(file.originalname)
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '');
      callback(null, `${randomUUID()}${extension}`);
    },
  });
  const upload = multer({ storage, limits: { fileSize: maxFileSizeBytes } });
  const repository = options.repository || new DocumentsRepository();
  const service = options.service || new DocumentsService(repository);
  const controller = options.controller || new DocumentsController(service);
  const router = express.Router();

  router.post('/upload', upload.single('file'), controller.upload);
  router.get('/documents', controller.list);
  router.get('/documents/:id/download', controller.download);

  router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      const isFileTooLarge = error.code === 'LIMIT_FILE_SIZE';
      res.status(isFileTooLarge ? 413 : 400).json({
        error: {
          code: isFileTooLarge ? 'FILE_TOO_LARGE' : 'INVALID_MULTIPART',
          message: isFileTooLarge
            ? 'O arquivo excede o limite permitido.'
            : 'O formulário de upload é inválido.',
        },
      });
      return;
    }

    next(error);
  });

  return router;
}

module.exports = createDocumentsRouter;