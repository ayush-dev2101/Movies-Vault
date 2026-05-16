import axios from 'axios';
import { ENV } from '../config/env';

const api = axios.create({
  baseURL: `${ENV.API_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Clerk Token
// Note: We will call a setter function from the App/Auth provider to update the token
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

api.interceptors.request.use(
  async (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.warn('[MovieVault] Unauthorized request - checking session...');
    }

    if (status === 408 || error.code === 'ECONNABORTED') {
      console.error('[MovieVault] Request Timeout - check network stability');
    }

    return Promise.reject(error);
  }
);

export default api;
