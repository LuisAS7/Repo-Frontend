import { axiosClient } from './axiosClient';

export const authService = {
    // Función para llamar a FastAPI y obtener el token
    login: async (username: string, password: string) => {
        // Transformamos los datos a formato x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        // Hacemos la petición POST a /auth/login
        const response = await axiosClient.post('/auth/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        });

        return response.data;
    },

    getMe: async () => {
        const response = await axiosClient.get('/staff/me');
        return response.data;
    }
};