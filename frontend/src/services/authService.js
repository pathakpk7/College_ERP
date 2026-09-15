import api from './api';

export const getCaptcha = async () => {
  const response = await api.get('/auth/captcha');
  return response.data;
};

export const login = async (identifier, password, captcha_id, captcha_solution, designation = null) => {
  const response = await api.post('/auth/login', {
    identifier,
    username: identifier,
    password,
    captcha_id,
    captcha_solution,
    designation,
  });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
