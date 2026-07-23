import React, { useState } from 'react';
import {
  Users,
  Shield,
  Key,
  Smartphone,
  Lock,
  Plus,
  TrendingUp,
  Activity,
  Sliders,
  UserCheck,
  Layers
} from 'lucide-react';
import {
  UserAccount,
  UserAccountStatus,
  GlobalAuthenticationPolicy,
  EmployeeSecurityProfile,
  EmployeeAuthenticationOverride,
  TemporarySecurityException,
  RegisteredDevice,
  SecurityDashboardMetrics,
  AuditTrailLog
} from '../../types/admin';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatCard } from '../../components/ui/StatCard';
import SecurityDashboardPage from './SecurityCenter/pages/SecurityDashboardPage';
import AuthenticationPoliciesPage from './SecurityCenter/pages/AuthenticationPoliciesPage';

interface AdminModuleProps {
  onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

type TabOption =
  | 'security-center'
  | 'auth-policies'
  | 'device-policies'
  | 'password-policies'
  | 'security-profiles'
  | 'employee-overrides'
  | 'employee-lifecycle'
  | 'audit-trail';

export default function AdminModule({ onTriggerToast }: AdminModuleProps) {
  const [activeTab, setActiveTab] = useState<TabOption>('security-center');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Mock Temporary Exceptions
  const [exceptions, setExceptions] = useState<TemporarySecurityException[]>([
    { id: 'EXC-901', employeeId: 'EMP-1004', employeeName: 'Vikram Singh (Driver)', exceptionType: 'SkipFaceAuth', reason: 'Temporary camera lens hardware malfunction on mobile terminal.', approvedBy: 'Siddharth Mehra (SuperAdmin)', approvedDate: '2026-07-23', startDate: '2026-07-23', expiryDate: '2026-07-26', isExpired: false }
  ]);

  // Mock Registered Devices
  const [devices] = useState<RegisteredDevice[]>([
    { id: 'DEV-01', deviceId: 'DEV-IPHONE-14-PRO', deviceName: 'Siddharth iPhone 14 Pro', osVersion: 'iOS 17.4', registeredToEmployeeName: 'Siddharth Mehra', registeredDate: '2026-01-15', lastUsedTimestamp: 'Today 09:15 AM', isTrusted: true, isBlocked: false }
  ]);

  // Mock User Accounts
  const [users, setUsers] = useState<UserAccount[]>([
    { id: 'USR-01', userCode: 'USR-9021', username: 'siddharth.mehra', fullName: 'Siddharth Mehra', email: 'admin@ink-fmcg.com', mobile: '+91 98765 43210', role: 'Super Administrator', mappedEmployeeCode: 'INK-EMP-1000', branch: 'Delhi Central', status: 'Enabled', securityProfileName: 'Admin Security Profile', lastLoginTimestamp: 'Today 09:15 AM', isMfaEnabled: true, registeredDevicesCount: 2 },
    { id: 'USR-02', userCode: 'USR-9022', username: 'rajiv.kapoor', fullName: 'Rajiv Kapoor', email: 'rajiv.kapoor@ink-fmcg.com', mobile: '+91 98111 22334', role: 'Sales Manager', mappedEmployeeCode: 'INK-EMP-1001', branch: 'Delhi Central', status: 'Enabled', securityProfileName: 'Salesman Security Profile', lastLoginTimestamp: 'Today 08:30 AM', isMfaEnabled: false, registeredDevicesCount: 1 }
  ]);

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

  const tabsList: Array<{ id: TabOption; label: string; icon: React.ComponentType<{ size?: number }> }> = [
    { id: 'security-center', label: 'Security Dashboard', icon: Shield },
    { id: 'auth-policies', label: 'Global Security Policies', icon: Key },
    { id: 'device-policies', label: 'Device Security', icon: Smartphone },
    { id: 'password-policies', label: 'Password & Session Rules', icon: Lock },
    { id: 'security-profiles', label: 'Role Security Profiles', icon: Layers },
    { id: 'employee-overrides', label: 'Overrides & Exceptions', icon: Sliders },
    { id: 'employee-lifecycle', label: 'Employee Account Manager', icon: UserCheck },
    { id: 'audit-trail', label: 'IAM Audit Log', icon: Activity }
  ];

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
        {tabsList.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* TAB SUB-PAGES */}
      {activeTab === 'security-center' && (
        <SecurityDashboardPage exceptions={exceptions} devices={devices} />
      )}

      {activeTab === 'auth-policies' && (
        <AuthenticationPoliciesPage
          globalPolicy={globalPolicy}
          setGlobalPolicy={setGlobalPolicy}
          onSave={() => onTriggerToast('success', 'Security Policy Saved', 'Global authentication policy matrix saved.')}
        />
      )}

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
