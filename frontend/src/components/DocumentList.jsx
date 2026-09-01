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
    return <p className="text-sm text-brand-500">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p className="text-sm text-brand-500">Nenhum documento encontrado.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-brand-200 bg-brand-50 text-left text-brand-700">
            <th scope="col" className="px-3 py-2 font-semibold">
              Nome
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Tamanho
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Enviado em
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((item, index) => (
            <tr
              key={item.id}
              className={index % 2 === 0 ? 'bg-white' : 'bg-brand-50/60'}
            >
              <td className="px-3 py-2 text-brand-700">{item.originalName}</td>
              <td className="px-3 py-2 text-brand-700">{formatSize(item.size)}</td>
              <td className="px-3 py-2 text-brand-700">{formatDate(item.uploadedAt)}</td>
              <td className="px-3 py-2">
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
    </div>
  );
}
