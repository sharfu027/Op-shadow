export interface RoleSecurityPolicy {
  requireFace: boolean;
  requireGps: boolean;
  require2Fa: boolean;
  requireDeviceReg: boolean;
  allowUnknownDevice: boolean;
  officeHoursOnly: boolean;
  allowOffline: boolean;
  autoMarkAttendance: boolean;
  radius: number;
}

export interface GlobalSecuritySettings {
  faceRecognitionGlobally: boolean;
  gpsVerificationGlobally: boolean;
  attendanceOnLogin: boolean;
  deviceRegistration: boolean;
  sessionTimeout: boolean;
  sessionTimeoutMinutes: number;
  loginAuditLogs: boolean;
  ipRestrictions: boolean;
  passwordExpiration: boolean;
  passwordExpirationDays: number;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  eventType: string;
  ipAddress: string;
  device: string;
  status: 'Passed' | 'Flagged' | 'Blocked';
}
