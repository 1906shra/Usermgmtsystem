import api from './axios';

export const loginApi          = (data)         => api.post('/auth/login', data);
export const registerApi       = (data)         => api.post('/auth/register', data);
export const adminRegisterApi  = (data)         => api.post('/auth/admin-register', data);
export const refreshTokenApi   = (refreshToken) => api.post('/auth/refresh', { refreshToken });
export const logoutApi         = ()             => api.post('/auth/logout');
export const getMeApi          = ()             => api.get('/auth/me');
