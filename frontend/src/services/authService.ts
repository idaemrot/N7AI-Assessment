import api from './api';
import { AuthResponse, LoginCredentials } from '../types';

/**
 * POST /api/auth/login
 *
 * Sends email + password, returns the full AuthResponse on success.
 * Throws an AxiosError (with response.data.message) on failure.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials);
  return data;
}
