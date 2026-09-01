import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentsApi';
import Button from './Button';

export default function UploadComponent({ userId, onUploaded }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!userId.trim()) {
      setMessage({ type: 'error', text: 'Informe o usuário antes de enviar.' });
      return;
    }

    if (!file) {
      setMessage({ type: 'error', text: 'Selecione um arquivo para enviar.' });
      return;
    }

    setIsSending(true);
    setMessage(null);

    try {
      const document = await uploadDocument(file, userId.trim());
      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      setMessage({ type: 'success', text: `Documento "${document.originalName}" enviado.` });
      onUploaded?.(document);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-700">Enviar documento</h2>
      <input
        ref={inputRef}
        type="file"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        disabled={isSending}
        className="block w-full text-sm text-brand-700 file:mr-4 file:rounded-md file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-200 disabled:opacity-60"
      />
      <Button type="submit" disabled={isSending} className="w-fit">
        {isSending ? 'Enviando...' : 'Enviar'}
      </Button>
      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm font-medium ${message.type === 'error' ? 'text-red-600' : 'text-green-700'}`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
