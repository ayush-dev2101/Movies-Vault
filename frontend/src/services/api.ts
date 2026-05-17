import axios from 'axios';
import { ENV } from '../config/env';

const api = axios.create({
  baseURL: `${ENV.API_URL}/api`,
  timeout: 30000, // Increased to 30s to accommodate Railway cold-starts
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
    console.log(`[Frontend-Trace] Requesting ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.data) {
      console.log(`[Frontend-Trace] Request Payload:`, JSON.stringify(config.data).slice(0, 150) + '...');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
  (response) => {
    console.log(`[Frontend-Trace] Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    console.log(`[Frontend-Trace] Response Error from ${error.config?.url}: Status ${status}`);
    if (error.response?.data) {
      console.log(`[Frontend-Trace] Response Details:`, JSON.stringify(error.response.data));
    }

    if (status === 401) {
      console.warn('[MovieVault] Unauthorized request - checking session...');
    }

    if (status === 408 || error.code === 'ECONNABORTED') {
      console.error('[MovieVault] Server is waking up or network is slow (Timeout)');
      // Modify the error message so the frontend can catch it properly instead of generic 'Network Error'
      error.message = 'Server timeout. Please try again.';
    } else if (!error.response) {
      console.error('[MovieVault] Network Error - Cannot reach backend:', ENV.API_URL);
    }

    return Promise.reject(error);
  }
);

export default api;
