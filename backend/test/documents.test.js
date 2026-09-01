// Testes de integração para as rotas de documentos.

const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');
const repository = require('../src/repositories/documentRepository');

// Garante isolamento entre testes limpando o repositório em memória.
beforeEach(() => repository.reset());

// Utilitário para fazer requisições HTTP ao app sem subir um servidor externo.
function request(server, options, body) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const req = http.request(
      { host: '127.0.0.1', port: addr.port, ...options },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString();
          let json;
          try { json = JSON.parse(raw); } catch { json = null; }
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw });
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Utilitário para upload multipart simples.
function uploadRequest(server, filePath, fieldName = 'file') {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const boundary = '----TestBoundary12345';
    const filename = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);

    const header = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n` +
      `Content-Type: application/octet-stream\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, fileContent, footer]);

    const req = http.request(
      {
        host: '127.0.0.1',
        port: addr.port,
        method: 'POST',
        path: '/upload',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString();
          let json;
          try { json = JSON.parse(raw); } catch { json = null; }
          resolve({ status: res.statusCode, body: json });
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

test('GET /health retorna status ok', async (t) => {
  const server = http.createServer(app).listen(0);
  t.after(() => server.close());

  const res = await request(server, { method: 'GET', path: '/health' });
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { status: 'ok' });
});

test('GET /documents retorna lista vazia inicialmente', async (t) => {
  const server = http.createServer(app).listen(0);
  t.after(() => server.close());

  const res = await request(server, { method: 'GET', path: '/documents' });
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.strictEqual(res.body.length, 0);
});

test('POST /upload sem arquivo retorna 400', async (t) => {
  const server = http.createServer(app).listen(0);
  t.after(() => server.close());

  const boundary = '----TestBoundaryEmpty';
  const body = Buffer.from(`--${boundary}--\r\n`);
  const res = await request(
    server,
    {
      method: 'POST',
      path: '/upload',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    },
    body
  );
  assert.strictEqual(res.status, 400);
});

test('POST /upload com arquivo retorna 201 e metadados', async (t) => {
  const server = http.createServer(app).listen(0);
  t.after(() => server.close());

  // Cria um arquivo temporário para o upload.
  const tmpFile = path.join('/tmp', `test-upload-${Date.now()}.txt`);
  fs.writeFileSync(tmpFile, 'conteúdo de teste');
  t.after(() => fs.rmSync(tmpFile, { force: true }));

  const res = await uploadRequest(server, tmpFile);
  assert.strictEqual(res.status, 201);
  assert.ok(res.body.id, 'deve retornar um id');
  assert.ok(res.body.name, 'deve retornar o nome original');

  // Limpa o arquivo salvo no storage.
  if (res.body.filename) {
    const storagePath = path.resolve(
      __dirname, '../storage', res.body.filename
    );
    fs.rmSync(storagePath, { force: true });
  }
});

test('GET /documents/:id/download retorna 404 para id inexistente', async (t) => {
  const server = http.createServer(app).listen(0);
  t.after(() => server.close());

  const res = await request(server, {
    method: 'GET',
    path: '/documents/id-inexistente/download',
  });
  assert.strictEqual(res.status, 404);
});
