export type UserAccountStatus =
  | 'Enabled'
  | 'Disabled'
  | 'Locked'
  | 'Suspended'
  | 'Archived'
  | 'PendingPasswordReset'
  | 'PendingActivation';

export type NotificationChannel = 'Email' | 'SMS' | 'WhatsApp' | 'Push';
export type LogSeverity = 'Info' | 'Warning' | 'SecurityAlert' | 'Error';

export type AuthenticationMode = 'Required' | 'Optional' | 'Disabled';

export interface FacePolicy {
  loginFace: AuthenticationMode;
  attendanceFace: AuthenticationMode;
  visitFace: AuthenticationMode;
  warehouseFace: AuthenticationMode;
  transactionFace: AuthenticationMode;
  managerApprovalFace: AuthenticationMode;
  inventoryAuditFace: AuthenticationMode;
}

export interface LocationPolicy {
  loginGps: AuthenticationMode;
  attendanceGps: AuthenticationMode;
  visitGps: AuthenticationMode;
  warehouseGps: AuthenticationMode;
  deliveryGps: AuthenticationMode;
  collectionsGps: AuthenticationMode;
  allowedRadiusMeters: number;
  gpsAccuracyMeters: number;
  mockLocationDetection: AuthenticationMode;
  backgroundTracking: AuthenticationMode;
}

export interface DevicePolicy {
  maxDevices: number;
  trustedDevicesOnly: AuthenticationMode;
  rootDetection: AuthenticationMode;
  jailbreakDetection: AuthenticationMode;
  emulatorDetection: AuthenticationMode;
  offlineLoginAllowed: AuthenticationMode;
  deviceRegistrationRequired: AuthenticationMode;
}

export interface SessionPolicy {
  sessionTimeoutMinutes: number;
  idleTimeoutMinutes: number;
  forceLogoutOnPasswordChange: boolean;
  allowConcurrentSessions: boolean;
  rememberDeviceAllowed: boolean;
  autoLogoutOnInactivity: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
  passwordHistoryCount: number;
  passwordExpiryDays: number;
  maxFailedAttempts: number;
  accountLockDurationMinutes: number;
}

export interface MFAPolicy {
  mfaMode: AuthenticationMode;
  supportedMethods: Array<'Face' | 'OTP' | 'Password' | 'Passkey' | 'AuthenticatorApp' | 'EmailOTP' | 'SMSOTP'>;
}

export interface GlobalAuthenticationPolicy {
  id: string;
  name: string;
  description: string;
  facePolicy: FacePolicy;
  locationPolicy: LocationPolicy;
  devicePolicy: DevicePolicy;
  sessionPolicy: SessionPolicy;
  passwordPolicy: PasswordPolicy;
  mfaPolicy: MFAPolicy;
}

export interface EmployeeSecurityProfile {
  id: string;
  profileCode: string;
  profileName: string; // e.g. Salesman Security Profile, Warehouse Security Profile, Finance Security Profile, etc.
  description: string;
  assignedPolicyId: string;
  assignedPolicyName: string;
  employeeCount: number;
  isSystemDefault: boolean;
}

export interface EmployeeAuthenticationOverride {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  useGlobalPolicy: boolean;
  loginFace?: AuthenticationMode;
  attendanceFace?: AuthenticationMode;
  visitFace?: AuthenticationMode;
  warehouseFace?: AuthenticationMode;
  loginGps?: AuthenticationMode;
  attendanceGps?: AuthenticationMode;
  visitGps?: AuthenticationMode;
  warehouseGps?: AuthenticationMode;
  otp?: AuthenticationMode;
  mfa?: AuthenticationMode;
  passwordExpiryDays?: number;
  sessionTimeoutMinutes?: number;
  maxDevices?: number;
}

export interface TemporarySecurityException {
  id: string;
  employeeId: string;
  employeeName: string;
  exceptionType: 'SkipFaceAuth' | 'SkipGPS' | 'SkipOTP' | 'SkipMFA';
  reason: string;
  approvedBy: string;
  approvedDate: string;
  startDate: string;
  expiryDate: string;
  isExpired: boolean;
}

export interface RegisteredDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  osVersion: string;
  registeredToEmployeeName: string;
  registeredDate: string;
  lastUsedTimestamp: string;
  isTrusted: boolean;
  isBlocked: boolean;
}

export interface SecurityDashboardMetrics {
  activeUsersCount: number;
  lockedUsersCount: number;
  disabledUsersCount: number;
  suspendedUsersCount: number;
  onlineUsersCount: number;
  offlineUsersCount: number;
  registeredDevicesCount: number;
  failedLoginsTodayCount: number;
  faceVerificationSuccessCount: number;
  faceVerificationFailureCount: number;
  gpsFailureRatePercent: number;
  policyViolationsCount: number;
  securityAlertsCount: number;
}

export interface UserAccount {
  id: string;
  userCode: string;
  username: string;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  mappedEmployeeCode?: string;
  branch: string;
  status: UserAccountStatus;
  securityProfileName?: string;
  lastLoginTimestamp?: string;
  isMfaEnabled: boolean;
  registeredDevicesCount?: number;
}

export interface UserSession {
  sessionId: string;
  username: string;
  ipAddress: string;
  deviceBrowser: string;
  loginTime: string;
  status: 'Active' | 'Terminated';
}

export interface RoleDefinition {
  id: string;
  roleCode: string;
  name: string;
  category: 'Executive' | 'Operations' | 'Finance' | 'FieldStaff' | 'SystemAdmin';
  description: string;
  assignedUsersCount: number;
  isSystemRole: boolean;
}

export interface PermissionItem {
  id: string;
  moduleName: string;
  pageName: string;
  actionKey: 'Create' | 'Read' | 'Update' | 'Delete' | 'Approve' | 'Export';
  isGranted: boolean;
}

export interface CompanySettings {
  companyName: string;
  logoUrl?: string;
  gstNumber: string;
  panNumber: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  financialYearStart: string;
  currency: string;
  timeZone: string;
  defaultLanguage: string;
}

export interface BranchSettings {
  id: string;
  branchCode: string;
  name: string;
  region: string;
  defaultWarehouseName: string;
  gstNumber: string;
  address: string;
  status: 'Active' | 'Inactive';
}

export interface NumberSeriesRule {
  id: string;
  documentType: 'PurchaseOrder' | 'SalesOrder' | 'SalesInvoice' | 'GRN' | 'Returns' | 'Employee' | 'Customer' | 'Supplier';
  prefix: string;
  suffix?: string;
  nextNumber: number;
  numberPaddingLength: number;
  sampleFormattedCode: string;
}

export interface NotificationTemplate {
  id: string;
  templateCode: string;
  name: string;
  channel: NotificationChannel;
  subjectOrHeader: string;
  bodyTemplate: string;
  variables: string[];
}

export interface AuditTrailLog {
  id: string;
  timestamp: string;
  username: string;
  actionType:
    | 'Login'
    | 'Logout'
    | 'FailedLogin'
    | 'FaceVerified'
    | 'FaceFailed'
    | 'GpsFailed'
    | 'AccountLocked'
    | 'AccountDisabled'
    | 'PasswordChanged'
    | 'PolicyModified'
    | 'DeviceRegistered'
    | 'DeviceRemoved'
    | 'SecurityOverrideApplied'
    | 'TemporaryBypassGranted';
  module: string;
  ipAddress: string;
  severity: LogSeverity;
  details: string;
}

export interface SystemConfiguration {
  sessionTimeoutMinutes: number;
  passwordExpiryDays: number;
  minPasswordLength: number;
  requireSpecialCharacter: boolean;
  enableBiometricAuth: boolean;
  enableGpsGeofencing: boolean;
  autoBackupFrequency: 'Daily' | 'Weekly';
}

export interface AdminMetrics {
  totalUsersCount: number;
  activeUsersCount: number;
  lockedUsersCount: number;
  totalRolesCount: number;
  activeSessionsCount: number;
  securityEventsToday: number;
}
