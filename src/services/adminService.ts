import { apiClient } from '../api/apiClient';
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
} from '../types/admin';

export const adminService = {
  // Users CRUD
  async getUsers(): Promise<UserAccount[]> {
    return apiClient.get<UserAccount[]>('/api/v1/admin/users');
  },

  async createUser(payload: Partial<UserAccount>): Promise<UserAccount> {
    return apiClient.post<UserAccount>('/api/v1/admin/users', payload);
  },

  async toggleLockUser(userId: string, lock: boolean): Promise<void> {
    return apiClient.post<void>(`/api/v1/admin/users/${userId}/lock`, { lock });
  },

  // Sessions
  async getActiveSessions(): Promise<UserSession[]> {
    return apiClient.get<UserSession[]>('/api/v1/admin/sessions');
  },

  // Roles & Permissions
  async getRoles(): Promise<RoleDefinition[]> {
    return apiClient.get<RoleDefinition[]>('/api/v1/admin/roles');
  },

  async createRole(payload: Partial<RoleDefinition>): Promise<RoleDefinition> {
    return apiClient.post<RoleDefinition>('/api/v1/admin/roles', payload);
  },

  async getPermissionMatrix(): Promise<PermissionItem[]> {
    return apiClient.get<PermissionItem[]>('/api/v1/admin/permissions');
  },

  // Company & Branch Settings
  async getCompanySettings(): Promise<CompanySettings> {
    return apiClient.get<CompanySettings>('/api/v1/admin/settings/company');
  },

  async updateCompanySettings(payload: Partial<CompanySettings>): Promise<CompanySettings> {
    return apiClient.put<CompanySettings>('/api/v1/admin/settings/company', payload);
  },

  async getBranchSettings(): Promise<BranchSettings[]> {
    return apiClient.get<BranchSettings[]>('/api/v1/admin/settings/branches');
  },

  // Number Series
  async getNumberSeries(): Promise<NumberSeriesRule[]> {
    return apiClient.get<NumberSeriesRule[]>('/api/v1/admin/number-series');
  },

  // Templates
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    return apiClient.get<NotificationTemplate[]>('/api/v1/admin/templates');
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditTrailLog[]> {
    return apiClient.get<AuditTrailLog[]>('/api/v1/admin/audit-logs');
  },

  // System Configuration
  async getSystemConfiguration(): Promise<SystemConfiguration> {
    return apiClient.get<SystemConfiguration>('/api/v1/admin/config');
  },

  // Admin Metrics
  async getAdminMetrics(): Promise<AdminMetrics> {
    return apiClient.get<AdminMetrics>('/api/v1/admin/metrics');
  }
};
