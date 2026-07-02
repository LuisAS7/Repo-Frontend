import { axiosClient } from './axiosClient';
import type { TokenResponse, CurrentUser } from '../types/api.types';

const TOKEN_KEY = 'valsync_token';

export const authService = {
  /**
   * Authenticates a user and stores the JWT token in localStorage.
   * Maps to: POST /auth/login (OAuth2PasswordRequestForm)
   */
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axiosClient.post<TokenResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Store token automatically so axiosClient can inject it
    localStorage.setItem(TOKEN_KEY, response.data.access_token);

    return response.data;
  },

  /**
   * Retrieves the currently authenticated user's profile.
   * Maps to: GET /users/me
   */
  getMe: async (): Promise<CurrentUser> => {
    const response = await axiosClient.get<CurrentUser>('/staff/me');
    return response.data;
  },

  /**
   * Clears the JWT token from localStorage, effectively logging out the user.
   */
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
  },

  /**
   * Checks whether a token exists in localStorage.
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};