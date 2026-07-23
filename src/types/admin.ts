export type UserAccountStatus = 'Active' | 'Locked' | 'Inactive' | 'PendingPasswordReset';
export type NotificationChannel = 'Email' | 'SMS' | 'WhatsApp' | 'Push';
export type LogSeverity = 'Info' | 'Warning' | 'SecurityAlert' | 'Error';

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
  lastLoginTimestamp?: string;
  isMfaEnabled: boolean;
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
  actionType: 'Login' | 'PasswordChange' | 'RecordCreated' | 'RecordUpdated' | 'RecordDeleted' | 'PermissionGranted';
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
