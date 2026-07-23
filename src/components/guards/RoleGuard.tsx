import React from 'react';
import { UserRole } from '../../types';

export interface RoleGuardProps {
  userRole: UserRole;
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ userRole, allowedRoles, children, fallback }: RoleGuardProps) {
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="p-8 bg-red-50/50 border border-red-200 rounded-lg text-center space-y-2">
        <h4 className="text-sm font-bold text-brand-danger uppercase">Access Denied</h4>
        <p className="text-xs text-brand-text-secondary">
          Your current role (<strong>{userRole}</strong>) does not have authorization to view this module.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
