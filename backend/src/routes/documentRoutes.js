// Rotas do módulo de documentos.

const express = require('express');
const multer = require('multer');
const path = require('path');
const controller = require('../controllers/documentController');
const { rateLimiter } = require('../middlewares/rateLimiter');

const STORAGE_DIR = path.resolve(__dirname, '../../storage');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, STORAGE_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${unique}-${safeName}`);
  },
});

const upload = multer({ storage });

const downloadLimiter = rateLimiter({ windowMs: 60_000, max: 30 });

const router = express.Router();

router.post('/upload', upload.single('file'), controller.uploadDocument);
router.get('/documents', controller.listDocuments);
router.get('/documents/:id/download', downloadLimiter, controller.downloadDocument);

module.exports = router;
