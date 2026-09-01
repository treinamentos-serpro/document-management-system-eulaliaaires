import { useState } from 'react';
import { downloadDocument } from '../services/documentsApi';
import Button from './Button';

export default function DownloadButton({ documentId, fileName, userId, onError }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleClick() {
    setIsDownloading(true);

    try {
      const blob = await downloadDocument(documentId, userId);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      onError?.(error.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleClick} disabled={isDownloading}>
      {isDownloading ? 'Baixando...' : 'Baixar'}
    </Button>
  );
}
