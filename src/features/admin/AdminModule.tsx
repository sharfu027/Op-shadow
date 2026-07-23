import React, { useState } from 'react';
import {
  Users,
  Shield,
  Key,
  Building,
  Hash,
  Bell,
  Activity,
  Settings,
  Lock,
  Unlock,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Clock,
  Layers,
  FileText,
  Sliders,
  Smartphone,
  MapPin,
  Camera,
  UserCheck,
  UserX,
  RefreshCw,
  LogOut,
  Trash2,
  Calendar,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import {
  UserAccount,
  UserAccountStatus,
  UserSession,
  RoleDefinition,
  PermissionItem,
  CompanySettings,
  BranchSettings,
  NumberSeriesRule,
  NotificationTemplate,
  AuditTrailLog,
  SystemConfiguration,
  AdminMetrics,
  GlobalAuthenticationPolicy,
  AuthenticationMode,
  EmployeeSecurityProfile,
  EmployeeAuthenticationOverride,
  TemporarySecurityException,
  RegisteredDevice,
  SecurityDashboardMetrics
} from '../../types/admin';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatCard } from '../../components/ui/StatCard';
import { EmptyState } from '../../components/ui/EmptyState';

interface AdminModuleProps {
  onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export default function AdminModule({ onTriggerToast }: AdminModuleProps) {
  const [activeTab, setActiveTab] = useState<
    | 'security-center'
    | 'auth-policies'
    | 'device-policies'
    | 'password-policies'
    | 'security-profiles'
    | 'employee-overrides'
    | 'employee-lifecycle'
    | 'audit-trail'
    | 'roles'
    | 'company'
    | 'series'
  >('security-center');

  const [searchQuery, setSearchQuery] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);

  // Mock IAM Dashboard Metrics
  const [iamMetrics] = useState<SecurityDashboardMetrics>({
    activeUsersCount: 48,
    lockedUsersCount: 2,
    disabledUsersCount: 1,
    suspendedUsersCount: 0,
    onlineUsersCount: 14,
    offlineUsersCount: 34,
    registeredDevicesCount: 52,
    failedLoginsTodayCount: 3,
    faceVerificationSuccessCount: 142,
    faceVerificationFailureCount: 4,
    gpsFailureRatePercent: 1.2,
    policyViolationsCount: 2,
    securityAlertsCount: 1
  });

  // Mock Global Authentication Policy
  const [globalPolicy, setGlobalPolicy] = useState<GlobalAuthenticationPolicy>({
    id: 'POL-GLOBAL-162',
    name: 'Enterprise Global Security Policy (v16.2)',
    description: 'Master IAM security rules applied across all company entities.',
    facePolicy: {
      loginFace: 'Required',
      attendanceFace: 'Required',
      visitFace: 'Required',
      warehouseFace: 'Required',
      transactionFace: 'Optional',
      managerApprovalFace: 'Required',
      inventoryAuditFace: 'Required'
    },
    locationPolicy: {
      loginGps: 'Required',
      attendanceGps: 'Required',
      visitGps: 'Required',
      warehouseGps: 'Required',
      deliveryGps: 'Required',
      collectionsGps: 'Required',
      allowedRadiusMeters: 500,
      gpsAccuracyMeters: 20,
      mockLocationDetection: 'Required',
      backgroundTracking: 'Optional'
    },
    devicePolicy: {
      maxDevices: 2,
      trustedDevicesOnly: 'Required',
      rootDetection: 'Required',
      jailbreakDetection: 'Required',
      emulatorDetection: 'Required',
      offlineLoginAllowed: 'Optional',
      deviceRegistrationRequired: 'Required'
    },
    sessionPolicy: {
      sessionTimeoutMinutes: 30,
      idleTimeoutMinutes: 15,
      forceLogoutOnPasswordChange: true,
      allowConcurrentSessions: false,
      rememberDeviceAllowed: true,
      autoLogoutOnInactivity: true
    },
    passwordPolicy: {
      minLength: 10,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: true,
      passwordHistoryCount: 5,
      passwordExpiryDays: 90,
      maxFailedAttempts: 3,
      accountLockDurationMinutes: 30
    },
    mfaPolicy: {
      mfaMode: 'Required',
      supportedMethods: ['Face', 'OTP', 'AuthenticatorApp']
    }
  });

  // Mock Security Profiles
  const [securityProfiles, setSecurityProfiles] = useState<EmployeeSecurityProfile[]>([
    { id: 'SEC-PROF-01', profileCode: 'PROF-SALESMAN', profileName: 'Salesman Security Profile', description: 'Enforces Face & GPS verification for field beat visits.', assignedPolicyId: 'POL-GLOBAL-162', assignedPolicyName: 'Field Sales Policy', employeeCount: 24, isSystemDefault: false },
    { id: 'SEC-PROF-02', profileCode: 'PROF-WAREHOUSE', profileName: 'Warehouse Security Profile', description: 'Requires Geofence & Face verification for warehouse entry.', assignedPolicyId: 'POL-GLOBAL-162', assignedPolicyName: 'Depot Security Policy', employeeCount: 12, isSystemDefault: false },
    { id: 'SEC-PROF-03', profileCode: 'PROF-FINANCE', profileName: 'Finance Security Profile', description: 'Requires 2FA OTP & strict session timeout for ledger access.', assignedPolicyId: 'POL-GLOBAL-162', assignedPolicyName: 'Financial Control Policy', employeeCount: 6, isSystemDefault: false },
    { id: 'SEC-PROF-04', profileCode: 'PROF-DRIVER', profileName: 'Driver Security Profile', description: 'Logistics mobile security profile with background GPS tracking.', assignedPolicyId: 'POL-GLOBAL-162', assignedPolicyName: 'Fleet Security Policy', employeeCount: 8, isSystemDefault: false }
  ]);

  // Mock Employee Overrides
  const [employeeOverrides, setEmployeeOverrides] = useState<EmployeeAuthenticationOverride[]>([
    { id: 'OVR-01', employeeId: 'EMP-1002', employeeCode: 'INK-EMP-1002', employeeName: 'Rajesh Kumar (Field Exec)', useGlobalPolicy: false, loginFace: 'Required', loginGps: 'Required', otp: 'Disabled', sessionTimeoutMinutes: 60, maxDevices: 1 }
  ]);

  // Mock Temporary Exceptions
  const [exceptions, setExceptions] = useState<TemporarySecurityException[]>([
    { id: 'EXC-901', employeeId: 'EMP-1004', employeeName: 'Vikram Singh (Driver)', exceptionType: 'SkipFaceAuth', reason: 'Temporary camera lens hardware malfunction on mobile terminal.', approvedBy: 'Siddharth Mehra (SuperAdmin)', approvedDate: '2026-07-23', startDate: '2026-07-23', expiryDate: '2026-07-26', isExpired: false }
  ]);

  // Mock Registered Devices
  const [devices, setDevices] = useState<RegisteredDevice[]>([
    { id: 'DEV-01', deviceId: 'DEV-IPHONE-14-PRO', deviceName: 'Siddharth iPhone 14 Pro', osVersion: 'iOS 17.4', registeredToEmployeeName: 'Siddharth Mehra', registeredDate: '2026-01-15', lastUsedTimestamp: 'Today 09:15 AM', isTrusted: true, isBlocked: false }
  ]);

  // Mock User Accounts with Lifecycle Status
  const [users, setUsers] = useState<UserAccount[]>([
    { id: 'USR-01', userCode: 'USR-9021', username: 'siddharth.mehra', fullName: 'Siddharth Mehra', email: 'admin@ink-fmcg.com', mobile: '+91 98765 43210', role: 'Super Administrator', mappedEmployeeCode: 'INK-EMP-1000', branch: 'Delhi Central', status: 'Enabled', securityProfileName: 'Admin Security Profile', lastLoginTimestamp: 'Today 09:15 AM', isMfaEnabled: true, registeredDevicesCount: 2 },
    { id: 'USR-02', userCode: 'USR-9022', username: 'rajiv.kapoor', fullName: 'Rajiv Kapoor', email: 'rajiv.kapoor@ink-fmcg.com', mobile: '+91 98111 22334', role: 'Sales Manager', mappedEmployeeCode: 'INK-EMP-1001', branch: 'Delhi Central', status: 'Enabled', securityProfileName: 'Salesman Security Profile', lastLoginTimestamp: 'Today 08:30 AM', isMfaEnabled: false, registeredDevicesCount: 1 },
    { id: 'USR-03', userCode: 'USR-9023', username: 'sunil.sharma', fullName: 'Sunil Sharma', email: 'sunil.sharma@ink-fmcg.com', mobile: '+91 98222 33445', role: 'Warehouse Operator', mappedEmployeeCode: 'INK-EMP-1005', branch: 'Delhi Central', status: 'Locked', securityProfileName: 'Warehouse Security Profile', lastLoginTimestamp: 'Yesterday 05:40 PM', isMfaEnabled: true, registeredDevicesCount: 1 }
  ]);

  // Mock Audit Logs
  const [auditLogs] = useState<AuditTrailLog[]>([
    { id: 'LOG-101', timestamp: 'Today 09:15 AM', username: 'siddharth.mehra', actionType: 'Login', module: 'IAM Security Center', ipAddress: '192.168.29.37', severity: 'Info', details: 'Successful 2FA OTP & Face verification.' },
    { id: 'LOG-102', timestamp: 'Today 08:45 AM', username: 'sunil.sharma', actionType: 'AccountLocked', module: 'IAM Security Center', ipAddress: '192.168.29.102', severity: 'SecurityAlert', details: 'Account locked due to 3 consecutive failed password attempts.' }
  ]);

  // Lifecycle Action Handler
  const handleLifecycleAction = (userId: string, action: 'Enable' | 'Disable' | 'Lock' | 'Unlock' | 'Suspend' | 'Archive' | 'ForceLogout') => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        let newStatus: UserAccountStatus = u.status;
        if (action === 'Enable' || action === 'Unlock') newStatus = 'Enabled';
        if (action === 'Disable') newStatus = 'Disabled';
        if (action === 'Lock') newStatus = 'Locked';
        if (action === 'Suspend') newStatus = 'Suspended';
        if (action === 'Archive') newStatus = 'Archived';
        return { ...u, status: newStatus };
      }
      return u;
    }));
    onTriggerToast('success', `Employee Action: ${action}`, `Account lifecycle status updated.`);
  };

  const handleCreateException = () => {
    const newExc: TemporarySecurityException = {
      id: `EXC-90${exceptions.length + 1}`,
      employeeId: 'EMP-1008',
      employeeName: 'Anand Singh (Sales Rep)',
      exceptionType: 'SkipGPS',
      reason: 'Network connectivity blackout in rural distributor zone.',
      approvedBy: 'Siddharth Mehra (SuperAdmin)',
      approvedDate: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: '2026-07-25',
      isExpired: false
    };
    setExceptions([...exceptions, newExc]);
    setIsExceptionModalOpen(false);
    onTriggerToast('success', 'Temporary Security Exception Granted', `Bypass approved for ${newExc.employeeName} until ${newExc.expiryDate}.`);
  };

  return (
    <div className="space-y-6">

      {/* SECTION 1: IAM EXECUTIVE SECURITY STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active User Accounts" value={`${iamMetrics.activeUsersCount} Users`} badgeText="Online: 14" badgeVariant="success" subLabel="Locked / Suspended" subValue={`${iamMetrics.lockedUsersCount} Locked | ${iamMetrics.suspendedUsersCount} Suspended`} />
        <StatCard title="Face Verification Success" value={`${iamMetrics.faceVerificationSuccessCount} Matches`} badgeText="Failure: 4" badgeVariant="primary" subLabel="Biometric Match Rate" subValue="97.2% Confidence" progressPercent={97.2} progressColor="success" />
        <StatCard title="Registered Security Devices" value={`${iamMetrics.registeredDevicesCount} Devices`} badgeText="Trusted Only" badgeVariant="info" subLabel="Root/Jailbreak Audited" subValue="Zero Unregistered" />
        <StatCard title="Security Alerts & Violations" value={`${iamMetrics.securityAlertsCount} Alerts`} badgeText="GPS Fail: 1.2%" badgeVariant="warning" subLabel="Failed Logins Today" subValue={`${iamMetrics.failedLoginsTodayCount} Failed`} />
      </div>

      {/* SECTION 2: IAM SUB-NAVIGATION TABS */}
      <div className="bg-white p-2 rounded-lg border border-brand-border shadow-sm flex flex-wrap gap-1">
        {[
          { id: 'security-center', label: 'Security Dashboard', icon: Shield },
          { id: 'auth-policies', label: 'Global Security Policies', icon: Key },
          { id: 'device-policies', label: 'Device Security', icon: Smartphone },
          { id: 'password-policies', label: 'Password & Session Rules', icon: Lock },
          { id: 'security-profiles', label: 'Role Security Profiles', icon: Layers },
          { id: 'employee-overrides', label: 'Overrides & Exceptions', icon: Sliders },
          { id: 'employee-lifecycle', label: 'Employee Account Manager', icon: UserCheck },
          { id: 'audit-trail', label: 'IAM Audit Log', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isActive ? 'bg-brand-primary text-white shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-bg-secondary'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: IAM SECURITY DASHBOARD */}
      {activeTab === 'security-center' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg border border-brand-border shadow-sm xl:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-brand-primary" /> Active Temporary Security Exceptions
            </h4>
            <div className="space-y-3 text-xs">
              {exceptions.map(exc => (
                <div key={exc.id} className="p-3 border rounded bg-brand-bg-secondary/30 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-brand-primary">{exc.employeeName} ({exc.exceptionType})</span>
                    <Badge variant={exc.isExpired ? 'danger' : 'warning'}>{exc.isExpired ? 'Expired' : 'Active Exception'}</Badge>
                  </div>
                  <p className="text-brand-text-secondary text-[11px]">Reason: "{exc.reason}"</p>
                  <p className="text-brand-text-secondary text-[11px]">Approved By: {exc.approvedBy} | Valid: {exc.startDate} to {exc.expiryDate}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-brand-border shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone size={16} className="text-brand-success" /> Registered Security Devices
            </h4>
            <div className="space-y-2 text-xs">
              {devices.map(dev => (
                <div key={dev.id} className="p-2.5 border rounded bg-brand-bg-secondary/40 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>{dev.deviceName}</span>
                    <Badge variant="success">Trusted Device</Badge>
                  </div>
                  <p className="text-brand-text-secondary text-[11px]">User: {dev.registeredToEmployeeName}</p>
                  <p className="text-brand-text-secondary text-[11px] font-mono">Last Active: {dev.lastUsedTimestamp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL SECURITY POLICIES */}
      {activeTab === 'auth-policies' && (
        <div className="bg-white p-6 rounded-lg border border-brand-border shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-brand-text-primary">{globalPolicy.name}</h3>
              <p className="text-xs text-brand-text-secondary">{globalPolicy.description}</p>
            </div>
            <button onClick={() => onTriggerToast('success', 'Security Policy Saved', 'Global authentication policy matrix saved.')} className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded cursor-pointer shadow-sm">
              Save Policy Rules
            </button>
          </div>

          {/* ENUM-BASED FACE & LOCATION MATRIX */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 border p-4 rounded-lg bg-brand-bg-secondary/20">
              <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Camera size={16} className="text-brand-primary" /> Face Authentication Matrix
              </h4>
              {[
                { label: 'Login Sign-In Face Check', key: 'loginFace' },
                { label: 'Attendance Clock-In Face Check', key: 'attendanceFace' },
                { label: 'Customer Visit Face Check', key: 'visitFace' },
                { label: 'Warehouse Entry Face Check', key: 'warehouseFace' },
                { label: 'Manager Approval Signature', key: 'managerApprovalFace' },
                { label: 'Inventory Audit Face Verification', key: 'inventoryAuditFace' }
              ].map(item => (
                <div key={item.key} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-brand-text-primary">{item.label}</span>
                  <select
                    value={(globalPolicy.facePolicy as any)[item.key]}
                    onChange={(e) => setGlobalPolicy({ ...globalPolicy, facePolicy: { ...globalPolicy.facePolicy, [item.key]: e.target.value as AuthenticationMode } })}
                    className="p-1 border rounded border-brand-border bg-white text-xs font-bold"
                  >
                    <option value="Required">Required</option>
                    <option value="Optional">Optional</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="space-y-3 border p-4 rounded-lg bg-brand-bg-secondary/20">
              <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={16} className="text-brand-success" /> Location & Geofence Matrix
              </h4>
              {[
                { label: 'Login Geofence Check', key: 'loginGps' },
                { label: 'Attendance Clock-In Geofence', key: 'attendanceGps' },
                { label: 'Customer Visit Geofence', key: 'visitGps' },
                { label: 'Warehouse Perimeter Check', key: 'warehouseGps' },
                { label: 'Delivery Handover Geofence', key: 'deliveryGps' },
                { label: 'Collections Payment Location', key: 'collectionsGps' }
              ].map(item => (
                <div key={item.key} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-brand-text-primary">{item.label}</span>
                  <select
                    value={(globalPolicy.locationPolicy as any)[item.key]}
                    onChange={(e) => setGlobalPolicy({ ...globalPolicy, locationPolicy: { ...globalPolicy.locationPolicy, [item.key]: e.target.value as AuthenticationMode } })}
                    className="p-1 border rounded border-brand-border bg-white text-xs font-bold"
                  >
                    <option value="Required">Required</option>
                    <option value="Optional">Optional</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: EMPLOYEE ACCOUNT LIFECYCLE MANAGER */}
      {activeTab === 'employee-lifecycle' && (
        <div className="bg-white rounded-lg border border-brand-border shadow-sm-flat overflow-hidden">
          <div className="p-4 border-b bg-brand-bg-secondary/10 flex justify-between items-center">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search employee code, username, status..." />
            <Badge variant="primary">IAM Account Lifecycle Controller</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-brand-bg-secondary border-b text-[10px] font-bold text-brand-text-secondary uppercase">
                <tr>
                  <th className="p-3">User Code</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Assigned Security Profile</th>
                  <th className="p-3">Devices</th>
                  <th className="p-3 text-center">Account Status</th>
                  <th className="p-3 text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-brand-bg-secondary/30">
                    <td className="p-3 font-mono font-bold text-brand-primary">{u.userCode}</td>
                    <td className="p-3 font-semibold">{u.fullName}</td>
                    <td className="p-3 text-brand-text-secondary">{u.securityProfileName}</td>
                    <td className="p-3 font-mono">{u.registeredDevicesCount || 1} Registered</td>
                    <td className="p-3 text-center">
                      <Badge variant={u.status === 'Enabled' ? 'success' : u.status === 'Locked' ? 'danger' : 'warning'}>{u.status}</Badge>
                    </td>
                    <td className="p-3 text-right flex justify-end gap-1">
                      {u.status === 'Enabled' ? (
                        <>
                          <button onClick={() => handleLifecycleAction(u.id, 'Lock')} className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold rounded hover:bg-amber-100 cursor-pointer">Lock</button>
                          <button onClick={() => handleLifecycleAction(u.id, 'Disable')} className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold rounded hover:bg-rose-100 cursor-pointer">Disable</button>
                        </>
                      ) : (
                        <button onClick={() => handleLifecycleAction(u.id, 'Enable')} className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold rounded hover:bg-emerald-100 cursor-pointer">Enable / Unlock</button>
                      )}
                      <button onClick={() => handleLifecycleAction(u.id, 'ForceLogout')} className="px-2 py-1 border text-brand-text-secondary text-[11px] font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer">Force Logout</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: OVERRIDES & EXCEPTIONS */}
      {activeTab === 'employee-overrides' && (
        <div className="bg-white rounded-lg border border-brand-border shadow-sm-flat p-5 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-brand-text-primary">Employee Authentication Overrides & Temporary Exceptions</h3>
              <p className="text-xs text-brand-text-secondary">Grant temporary security bypasses or specific policy overrides for individual employee accounts.</p>
            </div>
            <button onClick={() => setIsExceptionModalOpen(true)} className="px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded flex items-center gap-1 cursor-pointer">
              <Plus size={14} /> Grant Temporary Exception
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-brand-bg-secondary border-b text-[10px] font-bold text-brand-text-secondary uppercase">
                <tr>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Exception Type</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Approved By</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {exceptions.map(exc => (
                  <tr key={exc.id} className="hover:bg-brand-bg-secondary/30">
                    <td className="p-3 font-semibold text-brand-primary">{exc.employeeName}</td>
                    <td className="p-3 font-mono font-bold">{exc.exceptionType}</td>
                    <td className="p-3">{exc.reason}</td>
                    <td className="p-3 text-brand-text-secondary">{exc.approvedBy}</td>
                    <td className="p-3 font-mono">{exc.expiryDate}</td>
                    <td className="p-3 text-center"><Badge variant={exc.isExpired ? 'danger' : 'warning'}>{exc.isExpired ? 'Expired' : 'Active'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL TEMPORARY EXCEPTION */}
      {isExceptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-brand-border max-w-md w-full p-6 space-y-4 shadow-xl-flat">
            <h3 className="text-base font-bold text-brand-text-primary">Grant Temporary Security Exception</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-text-primary mb-1">Bypass Exception Type</label>
                <select className="w-full p-2 border rounded border-brand-border bg-white font-bold">
                  <option value="SkipGPS">Skip GPS Location Verification</option>
                  <option value="SkipFaceAuth">Skip Face Biometric Check</option>
                  <option value="SkipOTP">Skip 2FA OTP Verification</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-brand-text-primary mb-1">Audit Justification / Reason</label>
                <textarea rows={3} defaultValue="Temporary camera lens hardware malfunction on mobile terminal." className="w-full p-2 border rounded border-brand-border" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsExceptionModalOpen(false)} className="px-4 py-2 border text-xs font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer">Cancel</button>
              <button onClick={handleCreateException} className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded hover:bg-blue-700 cursor-pointer shadow-sm">Grant Exception</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
