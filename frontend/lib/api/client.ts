const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface ApiRequestOptions extends RequestInit {
  silent?: boolean;
  skipAuthRetry?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class ApiClient {
  static defaultHeaders: Record<string, string> = {}
  private static refreshPromise: Promise<string | null> | null = null

  private static async reauthenticate(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'demo@standbharat.ai', password: 'demo' }),
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.access_token) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('standbharat_token', data.access_token);
            }
            return data.access_token;
          }
        }
      } catch (e) {
        // Silent recovery fail
      } finally {
        this.refreshPromise = null;
      }
      return null;
    })();

    return this.refreshPromise;
  }

  static async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`
    
    const authHeaders: Record<string, string> = {}
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('standbharat_token') || localStorage.getItem('access_token')
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...this.defaultHeaders,
      ...options.headers,
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include' // required for HTTP-only cookies
      });
    } catch (fetchErr: any) {
      if (options.silent) {
        return null as unknown as T;
      }
      throw fetchErr;
    }

    // Auto-retry once on 401 for non-auth endpoints
    if (
      response.status === 401 &&
      !options.skipAuthRetry &&
      !endpoint.includes('/api/auth/login') &&
      !endpoint.includes('/api/auth/signup') &&
      !endpoint.includes('/api/auth/logout')
    ) {
      const newToken = await this.reauthenticate();
      if (newToken) {
        return this.request<T>(endpoint, {
          ...options,
          skipAuthRetry: true
        });
      }
    }
    
    if (!response.ok) {
      let message = `API Error (${response.status})`
      let errData: any = null
      try {
        errData = await response.json()
        if (typeof errData.detail === 'string') {
          message = errData.detail
        } else if (Array.isArray(errData.detail)) {
          message = errData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
        } else if (errData.message) {
          message = errData.message
        }
      } catch (e) {}

      if (options.silent) {
        return null as unknown as T;
      }

      throw new ApiError(message, response.status, errData)
    }
    return response.json()
  }

  static get<T>(endpoint: string, options: ApiRequestOptions = {}) { return this.request<T>(endpoint, { method: 'GET', ...options }) }
  static post<T>(endpoint: string, body: any, options: ApiRequestOptions = {}) { return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }) }
  static put<T>(endpoint: string, body: any, options: ApiRequestOptions = {}) { return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }) }
  static patch<T>(endpoint: string, body: any, options: ApiRequestOptions = {}) { return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }) }
  static delete<T>(endpoint: string, options: ApiRequestOptions = {}) { return this.request<T>(endpoint, { method: 'DELETE', ...options }) }
}

