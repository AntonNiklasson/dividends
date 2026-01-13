import { atom } from 'jotai';

export type UploadState = 'idle' | 'preview' | 'uploading' | 'success' | 'error';

export interface FilePreview {
  name: string;
  size: string;
}

export interface UploadStatus {
  state: UploadState;
  file: File | null;
  error: string | null;
  filePreview?: FilePreview;
}

export const uploadAtom = atom<UploadStatus>({
  state: 'idle',
  file: null,
  error: null,
});
