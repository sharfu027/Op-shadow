export type PolicyRequirementLevel = 'Required' | 'Optional' | 'Disabled';

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

export interface AuthenticationPolicy {
  policyId: string;
  policyName: string;
  loginFaceRequirement: PolicyRequirementLevel;
  loginGpsRequirement: PolicyRequirementLevel;
  otpRequirement: PolicyRequirementLevel;
  sessionTimeoutMinutes: number;
  allowedGeofenceRadiusMeters: number;
  officeHoursOnly: boolean;
  allowOffline: boolean;
}

export interface SecurityProfile {
  profileId: string;
  profileName: string; // e.g. 'Admin Security', 'Sales Security', 'Warehouse Security', 'Finance Security', 'HR Security', 'Driver Security', 'Manager Security', 'Support Security'
  description: string;
  defaultPolicy: AuthenticationPolicy;
  grantedPermissions: string[];
}

export interface EmployeeSecurityConfig {
  useGlobalPolicy: boolean;
  assignedSecurityProfileId: string;
  employeeOverridePolicy?: Partial<AuthenticationPolicy>;
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
  defaultGlobalPolicy: AuthenticationPolicy;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  user: string;
  securityProfileName: string;
  eventType: string;
  ipAddress: string;
  device: string;
  status: 'Passed' | 'Flagged' | 'Blocked';
}
