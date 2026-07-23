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
  Sliders
} from 'lucide-react';
import {
  UserAccount,
  UserSession,
  RoleDefinition,
  PermissionItem,
  CompanySettings,
  BranchSettings,
  NumberSeriesRule,
  NotificationTemplate,
  AuditTrailLog,
  SystemConfiguration,
  AdminMetrics
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
    'overview' | 'users' | 'roles' | 'permissions' | 'company' | 'branches' | 'series' | 'templates' | 'audit' | 'config'
  >('overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Mock Users
  const [users, setUsers] = useState<UserAccount[]>([
    { id: 'USR-01', userCode: 'USR-9021', username: 'siddharth.mehra', fullName: 'Siddharth Mehra', email: 'admin@ink-fmcg.com', mobile: '+91 98765 43210', role: 'Super Administrator', mappedEmployeeCode: 'INK-EMP-1000', branch: 'Delhi Central', status: 'Active', lastLoginTimestamp: 'Today 09:15 AM', isMfaEnabled: true },
    { id: 'USR-02', userCode: 'USR-9022', username: 'rajiv.kapoor', fullName: 'Rajiv Kapoor', email: 'rajiv.kapoor@ink-fmcg.com', mobile: '+91 98111 22334', role: 'Sales Manager', mappedEmployeeCode: 'INK-EMP-1001', branch: 'Delhi Central', status: 'Active', lastLoginTimestamp: 'Today 08:30 AM', isMfaEnabled: false }
  ]);

  // Mock Roles
  const [roles] = useState<RoleDefinition[]>([
    { id: 'ROL-01', roleCode: 'ROLE-SUPERADMIN', name: 'Super Administrator', category: 'Executive', description: 'Full unrestricted system-wide administrative privileges.', assignedUsersCount: 2, isSystemRole: true },
    { id: 'ROL-02', roleCode: 'ROLE-PROC-MGR', name: 'Procurement Manager', category: 'Operations', description: 'Manages POs, RFQs, Supplier Master, and GRN Reconciliations.', assignedUsersCount: 4, isSystemRole: false }
  ]);

  // Mock Number Series
  const [numberSeries] = useState<NumberSeriesRule[]>([
    { id: 'NS-01', documentType: 'PurchaseOrder', prefix: 'PO-2026-', nextNumber: 13, numberPaddingLength: 4, sampleFormattedCode: 'PO-2026-0013' },
    { id: 'NS-02', documentType: 'SalesInvoice', prefix: 'INV-DEL-2026-', nextNumber: 982, numberPaddingLength: 4, sampleFormattedCode: 'INV-DEL-2026-0982' }
  ]);

  // Mock Audit Logs
  const [auditLogs] = useState<AuditTrailLog[]>([
    { id: 'LOG-101', timestamp: 'Today 09:15 AM', username: 'siddharth.mehra', actionType: 'Login', module: 'Authentication', ipAddress: '192.168.29.37', severity: 'Info', details: 'Successful 2FA OTP login from Delhi Central.' }
  ]);

  const handleCreateUser = () => {
    const newUser: UserAccount = {
      id: `USR-0${users.length + 1}`,
      userCode: `USR-902${users.length + 1}`,
      username: 'amanpreet.kaur',
      fullName: 'Amanpreet Kaur',
      email: 'amanpreet@ink-fmcg.com',
      mobile: '+91 98999 11223',
      role: 'Inventory Controller',
      mappedEmployeeCode: 'INK-EMP-1003',
      branch: 'Delhi Central',
      status: 'Active',
      isMfaEnabled: true
    };
    setUsers([...users, newUser]);
    setIsUserModalOpen(false);
    onTriggerToast('success', 'User Account Created', `Account ${newUser.username} generated with role ${newUser.role}.`);
  };

  const handleToggleLock = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'Active' ? 'Locked' : 'Active' } : u));
    onTriggerToast('info', 'Security Status Updated', `User lock state toggled.`);
  };

  return (
    <div className="space-y-6">

      {/* SECTION 1: ADMIN KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total System Users" value={users.length + 48} badgeText="Active Sessions: 12" badgeVariant="success" subLabel="Active / Locked" subValue="48 Active | 2 Locked" />
        <StatCard title="Role Definitions (RBAC)" value={roles.length + 8} badgeText="System & Custom" badgeVariant="primary" subLabel="Permission Categories" subValue="5 Categories" />
        <StatCard title="Security Events Today" value={auditLogs.length + 14} badgeText="Audit Active" badgeVariant="info" subLabel="Security Alerts" subValue="0 Critical" />
        <StatCard title="2FA MFA Coverage" value="92.4%" badgeText="Target: >90%" badgeVariant="warning" subLabel="Enforced Roles" subValue="SuperAdmin & Finance" progressPercent={92.4} progressColor="success" />
      </div>

      {/* SECTION 2: SUB-NAVIGATION TABS */}
      <div className="bg-white p-2 rounded-lg border border-brand-border shadow-sm flex flex-wrap gap-1">
        {[
          { id: 'overview', label: 'Admin Overview', icon: TrendingUp },
          { id: 'users', label: 'User Accounts', icon: Users },
          { id: 'roles', label: 'Roles & RBAC', icon: Shield },
          { id: 'permissions', label: 'Permission Matrix', icon: Key },
          { id: 'company', label: 'Company Profile', icon: Building },
          { id: 'branches', label: 'Branch Settings', icon: Layers },
          { id: 'series', label: 'Number Series', icon: Hash },
          { id: 'templates', label: 'Notification Templates', icon: Bell },
          { id: 'audit', label: 'Audit Trail Logs', icon: Activity },
          { id: 'config', label: 'System Security Config', icon: Settings }
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

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg border border-brand-border shadow-sm xl:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">System Audit & Security Logs</h4>
            <div className="space-y-3 text-xs">
              {auditLogs.map(l => (
                <div key={l.id} className="p-3 border rounded bg-brand-bg-secondary/30 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-brand-primary">{l.actionType} ({l.username})</span>
                    <Badge variant="success">{l.severity}</Badge>
                  </div>
                  <p className="text-brand-text-secondary text-[11px]">Module: {l.module} | IP: {l.ipAddress} | Time: {l.timestamp}</p>
                  <p className="text-brand-text-secondary italic">"{l.details}"</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-brand-border shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Hash size={16} className="text-brand-primary" /> Document Number Series
            </h4>
            <div className="space-y-2 text-xs">
              {numberSeries.map(n => (
                <div key={n.id} className="p-2.5 border rounded bg-brand-bg-secondary/40 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>{n.documentType}</span>
                    <Badge variant="primary">{n.sampleFormattedCode}</Badge>
                  </div>
                  <p className="text-brand-text-secondary text-[11px]">Prefix: {n.prefix} | Next: {n.nextNumber}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg border border-brand-border shadow-sm-flat overflow-hidden">
          <div className="p-4 border-b bg-brand-bg-secondary/10 flex justify-between items-center">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search username, full name, role..." />
            <button onClick={() => setIsUserModalOpen(true)} className="px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded flex items-center gap-1 cursor-pointer">
              <Plus size={14} /> Create User Account
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-brand-bg-secondary border-b text-[10px] font-bold text-brand-text-secondary uppercase">
                <tr>
                  <th className="p-3">User Code</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Mapped Employee</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Lock Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-brand-bg-secondary/30">
                    <td className="p-3 font-mono font-bold text-brand-primary">{u.userCode}</td>
                    <td className="p-3 font-mono font-semibold">{u.username}</td>
                    <td className="p-3 font-semibold">{u.fullName}</td>
                    <td className="p-3 text-brand-text-secondary">{u.role}</td>
                    <td className="p-3 font-mono">{u.mappedEmployeeCode || 'N/A'}</td>
                    <td className="p-3">{u.branch}</td>
                    <td className="p-3 text-center"><Badge variant={u.status === 'Active' ? 'success' : 'danger'}>{u.status}</Badge></td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleToggleLock(u.id)} className="px-2.5 py-1 border text-xs font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer">
                        {u.status === 'Active' ? 'Lock Account' : 'Unlock Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CREATE USER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-brand-border max-w-md w-full p-6 space-y-4 shadow-xl-flat">
            <h3 className="text-base font-bold text-brand-text-primary">Create User Account</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-text-primary mb-1">Username</label>
                <input type="text" defaultValue="amanpreet.kaur" className="w-full p-2 border rounded border-brand-border" />
              </div>
              <div>
                <label className="block font-bold text-brand-text-primary mb-1">Assign Role</label>
                <select className="w-full p-2 border rounded border-brand-border bg-white">
                  <option value="Inventory Controller">Inventory Controller</option>
                  <option value="Sales Representative">Sales Representative</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 border text-xs font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer">Cancel</button>
              <button onClick={handleCreateUser} className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded hover:bg-blue-700 cursor-pointer shadow-sm">Save User</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
