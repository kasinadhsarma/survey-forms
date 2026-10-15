'use client';

import { useState } from 'react';
import { getErrorMessage, uploadFile } from '@/lib/fetch';
import { page, shared } from '@/lib/responsive/pattrens/forms';

type Props = { value: string; onChange: (id: string) => void };

/** Checks the file, uploads it to /api/files, stores the returned id. */
export function FileUploadField({ value, onChange }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onPick(file: File | undefined) {
    if (!file) {
      return;
    }
    setError(null);
    setStatus('Uploading...');
    try {
      onChange(await uploadFile(file));
      setStatus(`Uploaded ${file.name}`);
    } catch (e) {
      setStatus(null);
      setError(getErrorMessage(e));
    }
  }

  return (
    <div>
      <input
        type="file"
        className={shared.input}
        onChange={(event) => onPick(event.target.files?.[0])}
      />
      {value && status && <p className={page.muted}>{status}</p>}
      {error && <p className={page.error}>{error}</p>}
    </div>
  );
}
