import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import Button from './components/Button';
import TextField from './components/TextField';
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
    <main className="min-h-screen font-sans">
      <div className="mx-auto grid max-w-3xl gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="grid gap-4">
          <h1 className="text-2xl font-semibold text-brand-700 sm:text-3xl">
            Document Management System
          </h1>
          <TextField
            id="userId"
            label="Usuário"
            type="text"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="Informe seu identificador"
            className="max-w-xs"
          />
        </header>

        <UploadComponent userId={activeUserId} onUploaded={loadDocuments} />

        <section className="grid gap-3 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-brand-700">Documentos</h2>
            <Button
              variant="secondary"
              onClick={loadDocuments}
              disabled={!activeUserId || isLoading}
            >
              Atualizar lista
            </Button>
          </div>
          {errorMessage && (
            <p role="alert" aria-live="assertive" className="text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          )}
          <DocumentList
            documents={documents}
            userId={activeUserId}
            isLoading={isLoading}
            onError={setErrorMessage}
          />
        </section>
      </div>
    </main>
  );
}
