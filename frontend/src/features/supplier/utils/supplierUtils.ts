export const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' | 'primary' | 'info' => {
  const key = status.toUpperCase();
  const map: Record<string, any> = {
    'ACTIVE': 'success',
    'PENDING': 'warning',
    'PENDING APPROVAL': 'warning',
    'SUSPENDED': 'warning',
    'BLOCKED': 'danger',
    'BLACKLISTED': 'danger',
    'PREFERRED': 'primary',
    'INACTIVE': 'neutral',
    'ARCHIVED': 'neutral',
    'PROSPECT': 'info',
  };
  return map[key] ?? 'neutral';
};

export const getRiskColor = (level: number): string => {
  if (level <= 1) return 'text-brand-success';
  if (level === 2) return 'text-brand-warning';
  return 'text-brand-danger';
};

export const getRiskLabel = (level: number): string => {
  if (level <= 1) return 'Low';
  if (level === 2) return 'Medium';
  if (level === 3) return 'High';
  return 'Critical';
};

export const getPerformanceColor = (pct: number): string => {
  if (pct >= 90) return 'bg-brand-success';
  if (pct >= 70) return 'bg-brand-warning';
  return 'bg-brand-danger';
};

export const getPerformanceTextColor = (pct: number): string => {
  if (pct >= 90) return 'text-brand-success';
  if (pct >= 70) return 'text-brand-warning';
  return 'text-brand-danger';
};

export const hasPermission = (userRole: string, action: string): boolean => {
  const permissions: Record<string, string[]> = {
    'Super Administrator': ['create', 'edit', 'archive', 'block', 'approve', 'export', 'view'],
    'Administrator': ['create', 'edit', 'archive', 'approve', 'export', 'view'],
    'Procurement Manager': ['create', 'edit', 'export', 'view'],
    'Finance Manager': ['view', 'export'],
    'Director': ['view', 'approve', 'export'],
    'Branch Manager': ['view'],
    'Viewer': ['view'],
  };
  return (permissions[userRole] ?? ['view']).includes(action);
};
