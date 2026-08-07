import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Smartphone,
  ShieldCheck,
  Lock,
  UserX,
  Camera,
  Activity,
  AlertTriangle,
  Zap,
  CheckCircle2,
  XCircle,
  Key,
  Users,
  Clock,
  Unlock,
  RefreshCw,
  FileText,
  Monitor
} from 'lucide-react';
import { RegisteredDevice, AuditLogDto, AuditLogStatsDto } from '../../../../types/admin';
import { Badge } from '../../../../components/ui/Badge';
import { StatCard } from '../../../../components/ui/StatCard';
import { adminService } from '../../../../services/adminService';

interface SecurityDashboardPageProps {
  exceptions?: any[];
  devices?: RegisteredDevice[];
  onTriggerToast?: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export default function SecurityDashboardPage({
  onTriggerToast,
  onNavigateToTab
}: SecurityDashboardPageProps) {
  // ── Production States ──
  const [stats, setStats] = useState<AuditLogStatsDto>({
    totalEvents: 0,
    successfulLogins: 0,
    failedLogins: 0,
    faceVerifications: 0,
    userManagementEvents: 0,
    roleChanges: 0,
    securityExceptions: 0,
    criticalSecurityEvents: 0
  });

  const [lockedUsers, setLockedUsers] = useState<any[]>([]);
  const [failedLogins, setFailedLogins] = useState<AuditLogDto[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditLogDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(true);

  // ── Load Real-Time Dashboard Data from Backend ──
  const loadDashboardData = async (isSilent = false) => {
    if (isSilent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // 1. Fetch Audit Statistics
      const statsData = await adminService.getAuditLogStats();
      if (statsData) setStats(statsData);

      // 2. Fetch Locked Users
      const lockedRes = await adminService.fetchUsers({ isLocked: true, pageSize: 20 });
      if (lockedRes && lockedRes.items) {
        setLockedUsers(lockedRes.items);
      } else {
        setLockedUsers([]);
      }

      // 3. Fetch Failed Logins Audit Events
      const failedAuditRes = await adminService.fetchAuditLogs({ result: 'failure', pageSize: 30 });
      if (failedAuditRes && failedAuditRes.items) {
        const rawFailures = failedAuditRes.items;
        const uniqueFailedUsers: AuditLogDto[] = [];
        const seenFailedUserKeys = new Set<string>();

        for (const item of rawFailures) {
          const userKey = (item.userDisplayName || item.username || 'Unknown').trim().toLowerCase();
          if (!seenFailedUserKeys.has(userKey)) {
            seenFailedUserKeys.add(userKey);
            uniqueFailedUsers.push(item);
          }
          if (uniqueFailedUsers.length >= 6) break;
        }
        setFailedLogins(uniqueFailedUsers);
      } else {
        setFailedLogins([]);
      }

      // 4. Fetch Recent Audit Logs Timeline
      const recentAuditRes = await adminService.fetchAuditLogs({ pageSize: 50 });
      if (recentAuditRes && recentAuditRes.items) {
        const rawItems = recentAuditRes.items;
        const distinctUserTimeline: AuditLogDto[] = [];
        const seenUsers = new Set<string>();

        for (const item of rawItems) {
          const userKey = (item.userDisplayName || item.username || 'System').trim().toLowerCase();
          if (!seenUsers.has(userKey)) {
            seenUsers.add(userKey);
            distinctUserTimeline.push(item);
          }
          if (distinctUserTimeline.length >= 6) break;
        }

        setRecentActivity(distinctUserTimeline);
      } else {
        setRecentActivity([]);
      }

      setLastRefreshedAt(new Date());
    } catch (err: any) {
      console.error('Failed to load Security Dashboard data:', err);
      if (!isSilent && onTriggerToast) {
        onTriggerToast('error', 'Dashboard Load Failed', err?.message || 'Server connection error');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real-time Auto Refresh Loop Every 30 Seconds
  useEffect(() => {
    if (!isAutoRefreshActive) return;
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [isAutoRefreshActive]);

  // Unlock User Handler
  const handleUnlockUser = async (userId: string, userName: string) => {
    try {
      await adminService.unlockUser(userId);
      setLockedUsers(prev => prev.filter(u => u.id !== userId));
      if (onTriggerToast) {
        onTriggerToast('success', 'User Unlocked', `'${userName}' has been unlocked and access restored.`);
      }
      loadDashboardData(true);
    } catch (err: any) {
      console.error('Failed to unlock user:', err);
      if (onTriggerToast) {
        onTriggerToast('error', 'Unlock Failed', err?.message || 'Failed to unlock user account.');
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* ── SECTION 1: MATCHING EXECUTIVE HEADER TOOLBAR ── */}
      <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Security Control Dashboard</h2>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                <CheckCircle2 size={11} /> System Posture: Optimal
              </span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Auto-Sync (30s)
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Real-time security operations center monitoring authentication logs, failed attempt history, account access control, and active system security events.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadDashboardData()}
            disabled={isLoading || isRefreshing}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title={`Last refreshed at ${lastRefreshedAt.toLocaleTimeString()}`}
          >
            <RefreshCw size={14} className={isLoading || isRefreshing ? 'animate-spin text-brand-primary' : 'text-slate-500'} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* ── SECTION 2: TOP METRICS CARDS (MATCHING APP DESIGN) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Security Events"
          value={`${stats.totalEvents} Logs`}
          badgeText="Live Sync Active"
          badgeVariant="primary"
          subLabel="Authentications Today"
          subValue={`${stats.successfulLogins} Successful Logins`}
        />
        <StatCard
          title="Failed Login History"
          value={`${stats.failedLogins} Failures`}
          badgeText={stats.failedLogins > 0 ? 'Monitor' : 'Optimal'}
          badgeVariant={stats.failedLogins > 0 ? 'warning' : 'success'}
          subLabel="Critical Security Alerts"
          subValue={`${stats.criticalSecurityEvents} Triggered`}
        />
        <StatCard
          title="Biometric Verifications"
          value={`${stats.faceVerifications} Executed`}
          badgeText="Biometric Active"
          badgeVariant="info"
          subLabel="Authentication Pass Rate"
          subValue={`${stats.totalEvents > 0 ? ((stats.successfulLogins / stats.totalEvents) * 100).toFixed(1) : '100.0'}% Success`}
        />
        <StatCard
          title="Account Security Control"
          value={`${lockedUsers.length} Locked`}
          badgeText={lockedUsers.length > 0 ? 'Action Required' : 'All Clear'}
          badgeVariant={lockedUsers.length > 0 ? 'warning' : 'success'}
          subLabel="User Governance"
          subValue={`${stats.userManagementEvents} Lifecycle Events`}
        />
      </div>

      {/* ── SECTION 3: FAILED LOGINS & LOCKED ACCOUNTS (GRID 2-COL) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Failed Login Attempt Summary */}
        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <XCircle className="text-rose-500" size={18} /> Failed Login Attempt History
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
              {stats.failedLogins} Total Failures Recorded
            </span>
          </div>

          {failedLogins.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
              <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
              Zero failed login attempts detected in current audit window.
            </div>
          ) : (
            <div className="space-y-2.5">
              {failedLogins.map(fl => (
                <div key={fl.id} className="p-3 bg-slate-50 border border-brand-border/70 rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{fl.userDisplayName || fl.username}</span>
                      <span className="font-mono text-[10px] text-slate-400">({fl.ipAddress})</span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-medium">Reason: {fl.failureReason || fl.description || 'Authentication Failed'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] rounded-full block">
                      {fl.eventType || 'LOGIN_FAILED'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      {new Date(fl.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Currently Locked Accounts Control */}
        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="text-amber-500" size={18} /> Locked User Accounts Control
            </h3>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${lockedUsers.length > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              {lockedUsers.length} Locked
            </span>
          </div>

          {lockedUsers.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
              <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
              All user accounts are active and unlocked.
            </div>
          ) : (
            <div className="space-y-3">
              {lockedUsers.map(lu => (
                <div key={lu.id} className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{lu.displayName || `${lu.firstName} ${lu.lastName}`}</span>
                    <span className="text-[11px] text-slate-500 font-mono block">{lu.email || lu.userName}</span>
                    <span className="text-[10px] text-rose-600 font-bold mt-1 block">Account Locked out due to security threshold</span>
                  </div>
                  <button
                    onClick={() => handleUnlockUser(lu.id, lu.displayName || lu.userName)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
                  >
                    <Unlock size={14} /> Unlock Account
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── SECTION 4: RECENT LIVE AUDIT TRAIL TIMELINE ── */}
      <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Activity className="text-brand-primary" size={18} /> Live Security Audit Trail Timeline
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {stats.totalEvents} Events Logged
          </span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed text-slate-400 text-xs">
            No recent audit trail records recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {recentActivity.map(act => (
              <div key={act.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 bg-blue-50 text-brand-primary border border-blue-200 font-mono font-bold text-[10px] rounded-full">
                    {act.eventType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="font-bold text-slate-900 truncate">
                  {act.userDisplayName || act.username}
                </div>
                <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                  {act.description}
                </p>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>Module: {act.module}</span>
                  <span>IP: {act.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
