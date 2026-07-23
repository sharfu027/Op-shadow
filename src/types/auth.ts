export type UserRole =
  | 'Super Administrator'
  | 'Administrator'
  | 'Procurement Manager'
  | 'Warehouse Manager'
  | 'Inventory Controller'
  | 'Sales Manager'
  | 'Sales Representative'
  | 'Finance Manager'
  | 'Accountant'
  | 'Branch Manager'
  | 'Director';

export type UserPermission =
  | 'read:dashboard'
  | 'manage:masters'
  | 'manage:procurement'
  | 'manage:warehouse'
  | 'manage:inventory'
  | 'manage:sales'
  | 'manage:finance'
  | 'manage:security'
  | 'manage:users';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions?: UserPermission[];
  avatarUrl?: string;
  branch: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserProfile;
  expiresIn?: number;
}

export interface OtpVerificationParams {
  code: string;
  email: string;
}

export interface PasswordResetParams {
  email: string;
}

export interface ConfirmPasswordResetParams {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export interface FaceAuthParams {
  imageBlob: Blob | string;
  userId?: string;
}

export interface FaceAuthResult {
  success: boolean;
  confidenceScore: number;
  hashVector?: string;
  message: string;
}

export interface GpsAuthParams {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GpsAuthResult {
  success: boolean;
  distanceFromDepotMeters: number;
  allowedRadiusMeters: number;
  message: string;
}
