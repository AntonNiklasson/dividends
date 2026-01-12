import { atom } from 'jotai';

export type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadStatus {
  state: UploadState;
  file: File | null;
  error: string | null;
}

export const uploadAtom = atom<UploadStatus>({
  state: 'idle',
  file: null,
  error: null,
});
