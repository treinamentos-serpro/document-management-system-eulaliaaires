import DownloadButton from './DownloadButton';

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('pt-BR');
}

export default function DocumentList({ documents, userId, isLoading, onError }) {
  if (isLoading) {
    return <p>Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p>Nenhum documento encontrado.</p>;
  }

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>Nome</th>
          <th style={{ textAlign: 'left' }}>Tamanho</th>
          <th style={{ textAlign: 'left' }}>Enviado em</th>
          <th style={{ textAlign: 'left' }}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((item) => (
          <tr key={item.id}>
            <td>{item.originalName}</td>
            <td>{formatSize(item.size)}</td>
            <td>{formatDate(item.uploadedAt)}</td>
            <td>
              <DownloadButton
                documentId={item.id}
                fileName={item.originalName}
                userId={userId}
                onError={onError}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
