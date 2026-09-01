# Especificação - Document Management System

## 1. Objetivo

Entregar um sistema web simples para que usuários enviem, consultem e baixem
seus próprios documentos, com arquivos armazenados localmente e metadados
mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Upload de um arquivo por requisição.
- Listagem dos documentos pertencentes ao usuário solicitante.
- Download de documento pelo identificador, restrito ao proprietário.
- Identificação simples do usuário pelo header HTTP `X-User-Id`.
- Armazenamento dos arquivos no filesystem local da aplicação.
- Manutenção dos metadados em memória durante a execução da aplicação.
- Endpoint de verificação de saúde da API.
- Interface web em React para upload, listagem e download.

### Fora do escopo

- Cadastro, login, autenticação ou autorização baseada em tokens e sessões.
- Armazenamento externo ou em nuvem.
- Banco de dados e persistência dos metadados após reinício do processo.
- Versionamento, edição, exclusão ou compartilhamento de documentos.
- Upload de múltiplos arquivos em uma única requisição.
- Paginação, busca, ordenação e filtros na listagem.
- Restrição por extensão ou tipo MIME nesta fase.
- Antivírus, inspeção de conteúdo, quotas e auditoria.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário deve poder enviar um documento por meio de uma requisição multipart. |
| RF-02 | O sistema deve registrar os metadados do documento após o armazenamento bem-sucedido do arquivo. |
| RF-03 | O usuário deve poder listar somente os documentos dos quais é proprietário. |
| RF-04 | O usuário deve poder baixar um documento próprio pelo identificador. |
| RF-05 | O sistema deve impedir que um usuário baixe documentos pertencentes a outro usuário. |
| RF-06 | O sistema deve rejeitar requisições protegidas sem identificação de usuário válida. |
| RF-07 | O sistema deve rejeitar uploads sem arquivo ou acima do limite configurado. |
| RF-08 | O sistema deve informar quando um documento solicitado não existe. |
| RF-09 | O sistema deve disponibilizar uma verificação de saúde sem exigir identificação de usuário. |

### Critérios de aceite

#### RF-01 e RF-02 - Upload

- Dado um `X-User-Id` não vazio e um arquivo no campo `file`, quando o tamanho
  estiver dentro do limite, o sistema deve armazenar o arquivo e responder com
  status `201 Created` e os metadados públicos criados.
- O identificador deve ser um UUID e `uploadedAt` deve representar uma data e
  hora válida no formato ISO 8601.
- O nome físico do arquivo deve ser único e independente do nome fornecido pelo
  usuário, evitando sobrescrita em uploads concorrentes ou com nomes iguais.
- Os metadados somente devem ser registrados depois que o multer concluir a
  gravação do arquivo.

#### RF-03 - Listagem

- Dado um usuário identificado, a resposta deve ter status `200 OK` e conter
  um array, inclusive quando não houver documentos.
- Cada item deve conter somente metadados públicos.
- Nenhum documento pertencente a outro usuário deve aparecer na resposta.
- A ordem deve ser decrescente por `uploadedAt`, apresentando primeiro o upload
  mais recente.

#### RF-04, RF-05 e RF-08 - Download

- Dado o identificador de um documento do usuário, o sistema deve responder com
  status `200 OK`, conteúdo binário e headers apropriados para download.
- Se o documento existir e pertencer a outro usuário, a resposta deve ser
  `403 Forbidden` e não deve expor seus metadados nem seu conteúdo.
- Se o identificador não estiver registrado, a resposta deve ser
  `404 Not Found`.
- Se os metadados existirem, mas o arquivo físico não puder ser lido, o sistema
  deve responder `500 Internal Server Error` e registrar o erro no servidor.

#### RF-06 e RF-07 - Validação

- A ausência de `X-User-Id`, seu valor vazio após remoção de espaços ou mais de
  128 caracteres deve produzir `401 Unauthorized`.
- Um upload sem o campo `file` deve produzir `400 Bad Request`.
- Um upload acima do limite configurado deve produzir `413 Payload Too Large`
  e não deve deixar arquivo parcial disponível no storage.
- Qualquer tipo MIME é aceito nesta fase. O status `415 Unsupported Media Type`
  fica reservado para uma futura política de tipos permitidos.

#### RF-09 - Saúde

- `GET /health` deve responder `200 OK` com `{ "status": "ok" }`, sem acessar
  documentos e sem exigir `X-User-Id`.

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve usar Node.js, Express e módulos CommonJS. |
| RNF-02 | O frontend deve usar React, Vite, módulos ESM e componentes funcionais com Hooks. |
| RNF-03 | Os arquivos devem ser gravados exclusivamente no filesystem local por `multer.diskStorage`. |
| RNF-04 | O diretório padrão de armazenamento deve ser `backend/storage`. |
| RNF-05 | Os metadados devem permanecer em memória e podem ser perdidos ao reiniciar o processo. |
| RNF-06 | As configurações devem ser obtidas de variáveis de ambiente, seguindo 12-Factor App. |
| RNF-07 | O limite padrão por arquivo deve ser 10 MiB e deve ser configurável. |
| RNF-08 | Identificadores devem ser gerados por `crypto.randomUUID()`, sem dependência adicional. |
| RNF-09 | Datas devem ser produzidas em UTC no formato ISO 8601. |
| RNF-10 | Caminhos internos, nomes físicos e detalhes de erro do filesystem não devem ser expostos pela API. |
| RNF-11 | O backend deve respeitar o fluxo de dependências `routes -> controllers -> services -> repositories`. |
| RNF-12 | Erros devem ser tratados nos limites HTTP e de leitura ou escrita de arquivos. |
| RNF-13 | Os contratos essenciais do backend devem possuir testes automatizados com `node:test`. |

### Configuração de ambiente

| Variável | Obrigatória | Padrão | Regra |
| --- | --- | --- | --- |
| `PORT` | Não | `3000` | Número inteiro entre 1 e 65535. |
| `STORAGE_PATH` | Não | Diretório `backend/storage` resolvido pela aplicação | Caminho local; o diretório deve ser criado na inicialização quando não existir. |
| `MAX_FILE_SIZE_BYTES` | Não | `10485760` | Número inteiro positivo; equivale a 10 MiB por padrão. |

Valores configurados e inválidos devem interromper a inicialização com uma
mensagem clara, em vez de fazer a aplicação operar com configuração ambígua.

## 5. Modelo de dados

### Metadados internos do documento

| Campo | Tipo | Obrigatório | Origem e descrição | Exposição na API |
| --- | --- | --- | --- | --- |
| `id` | string | Sim | UUID gerado por `crypto.randomUUID()`. | Sim |
| `originalName` | string | Sim | Nome original recebido pelo multer. | Sim |
| `storedName` | string | Sim | Nome físico único gerado pela aplicação. | Não |
| `mimeType` | string | Sim | Tipo MIME informado na parte multipart. | Sim |
| `size` | number | Sim | Tamanho do arquivo em bytes, inteiro não negativo. | Sim |
| `uploadedAt` | string | Sim | Data e hora UTC do upload em ISO 8601. | Sim |
| `owner` | string | Sim | Valor normalizado do header `X-User-Id`. | Sim |
| `storagePath` | string | Sim | Caminho absoluto ou resolvido do arquivo no storage local. | Não |

### Representação pública

```json
{
  "id": "7ddd9f4f-0ff8-4fca-b3de-67c38ad32a12",
  "originalName": "relatorio.pdf",
  "mimeType": "application/pdf",
  "size": 245760,
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "usuario-123"
}
```

### Invariantes

- `id`, `storedName` e `storagePath` devem identificar um único documento
  durante a execução do processo.
- `owner` deve ser normalizado com remoção de espaços nas extremidades e não
  pode ser vazio nem ter mais de 128 caracteres.
- `originalName` deve ser preservado para exibição e para o nome sugerido no
  download, mas nunca deve ser usado diretamente como caminho físico.
- `storagePath` deve permanecer dentro de `STORAGE_PATH`.
- A API nunca deve retornar `storedName` ou `storagePath`.
- A perda dos metadados após reinício é comportamento conhecido desta fase; os
  arquivos remanescentes no diretório não serão reconstruídos automaticamente.

## 6. Contratos de API

O backend expõe os caminhos sem prefixo. O frontend acessa os mesmos recursos
com o prefixo `/api`; durante o desenvolvimento, o proxy do Vite remove esse
prefixo e encaminha a requisição ao backend.

Requisições e respostas JSON usam `Content-Type: application/json`. Os
endpoints de documentos exigem `X-User-Id`; somente o health check é público.

### Formato de erro

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Documento não encontrado."
  }
}
```

`code` é um identificador estável em inglês para consumo programático e
`message` é uma mensagem segura em português. Detalhes internos e stack traces
não integram o contrato público.

### POST /upload

Armazena um arquivo e cria seus metadados.

**Headers**

- `X-User-Id: <identificador>` obrigatório.
- `Content-Type: multipart/form-data; boundary=...` obrigatório.

**Corpo**

- Campo `file`: exatamente um arquivo, obrigatório.
- Campos adicionais não fazem parte do contrato e devem ser ignorados.

**Resposta de sucesso**

- Status: `201 Created`.
- Corpo: representação pública do documento criado.

```json
{
  "id": "7ddd9f4f-0ff8-4fca-b3de-67c38ad32a12",
  "originalName": "relatorio.pdf",
  "mimeType": "application/pdf",
  "size": 245760,
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "usuario-123"
}
```

**Erros**

| Status | Código | Condição |
| --- | --- | --- |
| `400` | `FILE_REQUIRED` | Campo `file` ausente ou sem arquivo válido. |
| `400` | `INVALID_MULTIPART` | Corpo multipart malformado. |
| `401` | `USER_ID_REQUIRED` | Header de usuário ausente ou inválido. |
| `413` | `FILE_TOO_LARGE` | Arquivo excede `MAX_FILE_SIZE_BYTES`. |
| `500` | `UPLOAD_FAILED` | Falha inesperada ao armazenar ou registrar o documento. |

### GET /documents

Lista os documentos pertencentes ao usuário, do mais recente para o mais
antigo.

**Headers**

- `X-User-Id: <identificador>` obrigatório.

**Resposta de sucesso**

- Status: `200 OK`.
- Corpo: array de representações públicas; `[]` quando não houver documentos.

```json
[
  {
    "id": "7ddd9f4f-0ff8-4fca-b3de-67c38ad32a12",
    "originalName": "relatorio.pdf",
    "mimeType": "application/pdf",
    "size": 245760,
    "uploadedAt": "2026-09-01T14:30:00.000Z",
    "owner": "usuario-123"
  }
]
```

**Erros**

| Status | Código | Condição |
| --- | --- | --- |
| `401` | `USER_ID_REQUIRED` | Header de usuário ausente ou inválido. |
| `500` | `DOCUMENT_LIST_FAILED` | Falha inesperada ao consultar os metadados. |

### GET /documents/:id/download

Baixa o conteúdo do documento identificado por `id`.

**Headers e parâmetros**

- `X-User-Id: <identificador>` obrigatório.
- `id`: UUID do documento no segmento de caminho.

**Resposta de sucesso**

- Status: `200 OK`.
- `Content-Type`: MIME registrado ou `application/octet-stream` como fallback.
- `Content-Length`: tamanho conhecido do arquivo em bytes.
- `Content-Disposition: attachment; filename*=UTF-8''<nome-codificado>`.
- Corpo: stream binário do arquivo, sem carregá-lo integralmente em memória.

**Erros**

| Status | Código | Condição |
| --- | --- | --- |
| `400` | `INVALID_DOCUMENT_ID` | Parâmetro `id` não é um UUID válido. |
| `401` | `USER_ID_REQUIRED` | Header de usuário ausente ou inválido. |
| `403` | `DOCUMENT_ACCESS_DENIED` | Documento pertence a outro usuário. |
| `404` | `DOCUMENT_NOT_FOUND` | Identificador não registrado. |
| `500` | `DOWNLOAD_FAILED` | Arquivo registrado não pode ser lido ou transmitido. |

### GET /health

Indica se o processo HTTP está disponível. Não verifica espaço em disco nem
integridade dos arquivos.

**Resposta de sucesso**

- Status: `200 OK`.

```json
{
  "status": "ok"
}
```

## 7. Decisões arquiteturais

### Backend

O backend segue uma Clean Architecture simples, com composição explícita das
dependências e sem abstrações além das necessárias para separar HTTP, regras de
negócio e persistência.

```text
routes -> controllers -> services -> repositories
```

- `routes/`: registra endpoints e middlewares, incluindo o multer configurado
  com `diskStorage`, e delega o tratamento HTTP aos controllers.
- `controllers/`: lê e valida headers, parâmetros e arquivo recebido; converte
  resultados e erros em respostas HTTP sem conter regras de propriedade.
- `services/`: cria metadados, aplica regras de negócio, filtra por proprietário
  e autoriza o download.
- `repositories/`: mantém metadados em memória e fornece operações de inclusão,
  consulta por proprietário e consulta por identificador. O acesso ao arquivo
  local usa somente caminhos previamente registrados e confinados ao storage.
- `app.js`: compõe dependências, instala rotas e o tratamento global de erros;
  a inicialização do servidor permanece separada do app testável.

As camadas internas não importam Express. Objetos HTTP ficam restritos às rotas,
middlewares e controllers. Falhas conhecidas são representadas por erros da
aplicação e traduzidas para HTTP no limite externo.

O multer grava o arquivo antes da execução do controller. Se qualquer etapa
posterior do upload falhar, a aplicação deve tentar remover o arquivo gravado
para evitar arquivos órfãos. Falhas nessa limpeza devem ser registradas, sem
substituir o erro original enviado ao cliente.

### Armazenamento

- O armazenamento é estritamente local; provedores externos não são permitidos.
- `multer.diskStorage` deve usar `STORAGE_PATH` como destino.
- O nome físico deve ser gerado a partir de um valor único e pode preservar uma
  extensão sanitizada apenas para conveniência operacional.
- O nome original jamais deve participar da resolução do caminho de destino.
- Metadados em memória são a fonte de consulta durante a execução atual.

### Frontend

- O frontend será organizado em `components/`, `pages/` e `services/`.
- Um serviço baseado em `fetch` centralizará chamadas para `/api/upload`,
  `/api/documents` e `/api/documents/:id/download`.
- Componentes funcionais cuidarão do formulário de upload, estado de progresso,
  mensagens de erro, lista vazia, atualização da lista e ação de download.
- O identificador simples do usuário será informado às chamadas por
  `X-User-Id`; sua obtenção na interface não representa autenticação real.
- O frontend não dependerá de caminhos físicos nem de campos internos.

## 8. Plano de execução

As etapas abaixo descrevem implementação futura. Nesta etapa de especificação,
nenhum arquivo de backend ou frontend deve ser criado, alterado ou executado.

1. **Contratos e testes iniciais do backend:** transformar os critérios de
   aceite em testes com `node:test`, cobrindo autenticação simples, upload,
   listagem, autorização, download e erros, preservando o teste de saúde.
2. **Repositório de metadados:** implementar inclusão, busca por identificador e
   listagem por proprietário em memória, com testes unitários e ordenação por
   data decrescente.
3. **Configuração do storage:** validar as variáveis de ambiente, criar o
   diretório local quando necessário e configurar `multer.diskStorage`, nome
   físico único e limite de tamanho.
4. **Serviço de documentos:** implementar criação dos metadados, UUID, regras de
   propriedade, projeção pública, autorização de download e limpeza do arquivo
   em falhas posteriores ao upload.
5. **Controllers e erros HTTP:** implementar validação dos dados de entrada,
   respostas de sucesso, envelope padronizado e tradução dos erros conhecidos.
6. **Rotas e composição da aplicação:** registrar os três endpoints de
   documentos, preservar `/health`, injetar as dependências e adicionar o
   middleware global de erros.
7. **Integração do backend:** executar os testes de contrato e validar gravação,
   listagem isolada, stream de download, concorrência de nomes e ausência de
   arquivos parciais ou órfãos nos cenários cobertos.
8. **Serviço do frontend:** implementar as chamadas via `fetch` com prefixo
   `/api`, envio multipart, header de usuário, interpretação de erros e download
   por blob ou navegação controlada.
9. **Interface do frontend:** implementar a página e os componentes de upload,
   listagem e download, contemplando carregamento, lista vazia, sucesso e erro.
10. **Validação ponta a ponta:** verificar os fluxos entre Vite e Express em
    desktop e mobile, executar testes e builds disponíveis e confirmar todos os
    critérios de aceite antes da entrega.
