import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de solicitudes (request) - Para inyectar el token automáticamente en cada petición
axiosClient.interceptors.request.use(
    (config) => {
        // Buscamos el token donde lo vayas a guardar cuando hagas login
        const token = localStorage.getItem('valsync_token');
        
        // Si hay token, lo inyectamos automáticamente en la cabecera Authorization
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuestas (response) - Para manejar errores globalmente, como expiración de token
axiosClient.interceptors.response.use(
    (response) => {
        // Cualquier código de estado 2xx activa esta función
        return response;
    },
    (error) => {
        // Cualquier código de estado fuera de 2xx (ej. 401, 403, 500) activa esto
        if (error.response && error.response.status === 401) {
            console.error("Token expirado o inválido. Redirigiendo al login...");
            localStorage.removeItem('valsync_token');
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);