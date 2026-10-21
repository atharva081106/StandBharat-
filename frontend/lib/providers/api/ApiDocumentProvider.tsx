import { getCookie } from 'cookies-next';
import { BrandDocument } from '../DocumentProvider';
import { ApiClient } from '../../api/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getHeaders = () => {
  let token = (getCookie('access_token') as string) || '';
  let wsId = (getCookie('workspace_id') as string) || '';
  let brandId = (getCookie('brand_id') as string) || '';

  if (typeof window !== 'undefined') {
    if (!token) token = localStorage.getItem('standbharat_token') || localStorage.getItem('access_token') || '';
    if (!wsId && ApiClient.defaultHeaders['X-Workspace-ID']) wsId = ApiClient.defaultHeaders['X-Workspace-ID'];
    if (!brandId && ApiClient.defaultHeaders['X-Brand-ID']) brandId = ApiClient.defaultHeaders['X-Brand-ID'];
  }

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (wsId) headers['X-Workspace-ID'] = wsId;
  if (brandId) headers['X-Brand-ID'] = brandId;
  return headers;
};

export const ApiDocumentProvider = {
  getDocuments: async (): Promise<BrandDocument[]> => {
    const headers = getHeaders();

    const res = await fetch(`${API_BASE_URL}/api/brand-brain/documents`, {
      headers,
      credentials: 'include'
    });

    if (!res.ok) {
      if (res.status === 404 || res.status === 400) return [];
      throw new Error('Failed to fetch documents');
    }

    return res.json();
  },

  uploadDocument: async (file: File, category: string): Promise<BrandDocument> => {
    const headers = getHeaders();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const res = await fetch(`${API_BASE_URL}/api/brand-brain/documents`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
    }

    return res.json();
  },

  createDocument: async (data: { name: string; content: string; category?: string; type?: string }): Promise<BrandDocument> => {
    const headers = getHeaders();
    headers['Content-Type'] = 'application/json';

    const res = await fetch(`${API_BASE_URL}/api/brand-brain/documents/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create document');
    }

    return res.json();
  },

  generateRealDocuments: async (): Promise<BrandDocument[]> => {
    const headers = getHeaders();

    const res = await fetch(`${API_BASE_URL}/api/brand-brain/documents/generate-real`, {
      method: 'POST',
      headers,
      credentials: 'include'
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to generate real documents');
    }

    return res.json();
  },

  getDocument: async (id: string): Promise<BrandDocument> => {
    const headers = getHeaders();

    const res = await fetch(`${API_BASE_URL}/api/brand-brain/documents/${id}`, {
      headers,
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Failed to fetch document');
    }

    return res.json();
  },

  deleteDocument: async (id: string): Promise<void> => {
    const headers = getHeaders();

    const res = await fetch(`${API_BASE_URL}/api/brand-brain/documents/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Failed to delete document');
    }
  }
};
