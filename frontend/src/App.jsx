import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/documentsApi';

export default function App() {
  const [userId, setUserId] = useState('');
  const [activeUserId, setActiveUserId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Evita uma requisição por tecla digitada no campo de usuário.
  useEffect(() => {
    const timeoutId = setTimeout(() => setActiveUserId(userId.trim()), 400);
    return () => clearTimeout(timeoutId);
  }, [userId]);

  const loadDocuments = useCallback(async () => {
    if (!activeUserId) {
      setDocuments([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      setDocuments(await listDocuments(activeUserId));
    } catch (error) {
      setDocuments([]);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
        display: 'grid',
        gap: '2rem',
      }}
    >
      <header>
        <h1>Document Management System</h1>
        <label style={{ display: 'grid', gap: '0.25rem', maxWidth: '20rem' }}>
          Usuário
          <input
            type="text"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="Informe seu identificador"
          />
        </label>
      </header>

      <UploadComponent userId={activeUserId} onUploaded={loadDocuments} />

      <section style={{ display: 'grid', gap: '0.5rem' }}>
        <h2>Documentos</h2>
        <button type="button" onClick={loadDocuments} disabled={!activeUserId || isLoading}>
          Atualizar lista
        </button>
        {errorMessage && <p style={{ color: '#b00020' }}>{errorMessage}</p>}
        <DocumentList
          documents={documents}
          userId={activeUserId}
          isLoading={isLoading}
          onError={setErrorMessage}
        />
      </section>
    </main>
  );
}
