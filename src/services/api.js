import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      // dispatch a custom event so Toast can show "Session expired"
      window.dispatchEvent(new CustomEvent('session-expired'));
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;
