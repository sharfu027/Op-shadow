import { apiClient } from '../api/apiClient';
import {
  LoginCredentials,
  AuthResponse,
  UserProfile,
  OtpVerificationParams,
  PasswordResetParams,
  ConfirmPasswordResetParams,
  ChangePasswordParams,
  FaceAuthParams,
  FaceAuthResult,
  GpsAuthParams,
  GpsAuthResult
} from '../types/auth';
import { STORAGE_KEYS } from '../constants/app';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);
    if (response.token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(response.user));
    }
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<void>('/api/v1/auth/logout');
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    }
  },

  async getCurrentUser(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/api/v1/auth/me');
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/api/v1/auth/refresh');
    if (response.token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
    }
    return response;
  },

  async verifyOtp(params: OtpVerificationParams): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/v1/auth/verify-otp', params);
  },

  async requestPasswordReset(params: PasswordResetParams): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/api/v1/auth/forgot-password', params);
  },

  async confirmPasswordReset(params: ConfirmPasswordResetParams): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/api/v1/auth/reset-password', params);
  },

  async changePassword(params: ChangePasswordParams): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/api/v1/auth/change-password', params);
  },

  async verifyFaceBiometrics(params: FaceAuthParams): Promise<FaceAuthResult> {
    return apiClient.post<FaceAuthResult>('/api/v1/auth/verify-face', params);
  },

  async verifyGpsGeofence(params: GpsAuthParams): Promise<GpsAuthResult> {
    return apiClient.post<GpsAuthResult>('/api/v1/auth/verify-gps', params);
  }
};
