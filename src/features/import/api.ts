import { apiClient, type Envelope } from '@/api/client';

import type {
  ImportConfirmResult,
  ImportPreview,
  ImportRowUpdatePayload,
  ImportRow,
} from './types';

export async function uploadImport(file: FormData): Promise<ImportPreview> {
  const response = await apiClient.post<Envelope<ImportPreview>>('/import/upload', file, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data as ImportPreview;
}

export async function getImportPreview(jobId: string): Promise<ImportPreview> {
  const response = await apiClient.get<Envelope<ImportPreview>>(`/import/${jobId}/preview`);
  return response.data.data as ImportPreview;
}

export async function updateImportRow(
  jobId: string,
  rowId: string,
  payload: ImportRowUpdatePayload,
): Promise<ImportRow> {
  const response = await apiClient.patch<Envelope<ImportRow>>(
    `/import/${jobId}/rows/${rowId}`,
    payload,
  );
  return response.data.data as ImportRow;
}

export async function confirmImport(jobId: string): Promise<ImportConfirmResult> {
  const response = await apiClient.post<Envelope<ImportConfirmResult>>(`/import/${jobId}/confirm`);
  return response.data.data as ImportConfirmResult;
}
