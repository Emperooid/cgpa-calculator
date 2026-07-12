import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cgpa_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('cgpa_refresh');
        if (!refresh) throw new Error('No refresh token');
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/auth/refresh`,
          { refreshToken: refresh },
        );
        localStorage.setItem('cgpa_token', data.accessToken);
        localStorage.setItem('cgpa_refresh', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshErr: any) {
        // Only wipe tokens on a real HTTP auth rejection (4xx from the server).
        // Network errors (no response object) mean the backend is cold-starting;
        // don't log the user out — let the original request fail gracefully.
        if (refreshErr?.response) {
          const isAnon = !!localStorage.getItem('cgpa_is_anon');
          localStorage.removeItem('cgpa_token');
          localStorage.removeItem('cgpa_refresh');
          localStorage.removeItem('cgpa_is_anon');
          // Anonymous users go back to landing so GuestAuth creates a fresh session.
          // Registered users go to login.
          window.location.href = isAnon ? '/' : '/login';
        }
      }
    }
    return Promise.reject(err);
  },
);

export default api;
