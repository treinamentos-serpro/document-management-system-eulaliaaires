import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentsApi';

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
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem' }}>
      <h2>Enviar documento</h2>
      <input
        ref={inputRef}
        type="file"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        disabled={isSending}
      />
      <button type="submit" disabled={isSending}>
        {isSending ? 'Enviando...' : 'Enviar'}
      </button>
      {message && (
        <p style={{ color: message.type === 'error' ? '#b00020' : '#0a7d28' }}>{message.text}</p>
      )}
    </form>
  );
}
