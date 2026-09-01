---
description: Aplica Tailwind CSS 3 no frontend do DMS e moderniza a interface de upload, listagem e download.
name: estilizar-tailwind
argument-hint: tema visual desejado (ex. claro e minimalista)
agent: ui-tailwind
---

# Estilizar o frontend com Tailwind CSS 3

Melhore o visual da aplicação adotando **Tailwind CSS 3** no frontend, com um tema
`${input:tema:tema visual desejado (ex. claro e minimalista)}`.

## 1. Configuração

- Instale `tailwindcss@3`, `postcss` e `autoprefixer` em `frontend/`.
- Crie `frontend/tailwind.config.js` e `frontend/postcss.config.js`.
- Aponte `content` para `./index.html` e `./src/**/*.{js,jsx}`.
- Crie `frontend/src/index.css` com as diretivas do Tailwind e importe em
  [frontend/src/main.jsx](../../frontend/src/main.jsx).

## 2. Refatoração visual

Converta os estilos inline atuais para classes utilitárias:

- [frontend/src/App.jsx](../../frontend/src/App.jsx): cabeçalho com título, campo de
  usuário e seções de upload e documentos em um container centralizado.
- [frontend/src/components/UploadComponent.jsx](../../frontend/src/components/UploadComponent.jsx):
  cartão de upload com input de arquivo estilizado, botão com estado de envio e
  mensagens de sucesso/erro.
- [frontend/src/components/DocumentList.jsx](../../frontend/src/components/DocumentList.jsx):
  tabela responsiva com cabeçalho destacado, linhas zebradas e estados de
  carregamento e lista vazia.
- [frontend/src/components/DownloadButton.jsx](../../frontend/src/components/DownloadButton.jsx):
  botão secundário com estado de download em andamento.

## 3. Reuso

Extraia componentes compartilhados para evitar repetição de classes, por exemplo
`Button` e `TextField` em `frontend/src/components`.

## 4. Validação

- Rode `npm run build` em `frontend/` e corrija eventuais erros.
- Confirme que upload, listagem e download continuam funcionando.

## Restrições

- Não altere o backend nem o cliente de API em `frontend/src/services`.
- Não adicione bibliotecas de componentes além do Tailwind.
- Mensagens ao usuário em português.
