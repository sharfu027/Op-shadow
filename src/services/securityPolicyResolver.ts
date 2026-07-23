import { AuthenticationPolicy, SecurityProfile, GlobalSecuritySettings } from '../types/security';
import { UserProfile } from '../types/auth';

// System Default Global Policy
export const DEFAULT_GLOBAL_POLICY: AuthenticationPolicy = {
  policyId: 'POL-GLOBAL-DEFAULT',
  policyName: 'Global Company Standard Security Policy',
  loginFaceRequirement: 'Disabled',
  loginGpsRequirement: 'Disabled',
  otpRequirement: 'Required',
  sessionTimeoutMinutes: 30,
  allowedGeofenceRadiusMeters: 500,
  officeHoursOnly: false,
  allowOffline: false
};

// Pre-configured Enterprise Security Profiles (Supports Admin, Sales, Warehouse, Finance, HR, Driver, Manager, Support, Auditor, etc.)
export const ENTERPRISE_SECURITY_PROFILES: Record<string, SecurityProfile> = {
  'SEC-ADMIN': {
    profileId: 'SEC-ADMIN',
    profileName: 'Admin Security',
    description: 'High-privilege security profile for system administrators and directors.',
    defaultPolicy: {
      policyId: 'POL-ADMIN',
      policyName: 'Admin Security Policy',
      loginFaceRequirement: 'Required',
      loginGpsRequirement: 'Disabled',
      otpRequirement: 'Required',
      sessionTimeoutMinutes: 15,
      allowedGeofenceRadiusMeters: 1000,
      officeHoursOnly: false,
      allowOffline: false
    },
    grantedPermissions: ['read:dashboard', 'manage:masters', 'manage:procurement', 'manage:warehouse', 'manage:inventory', 'manage:sales', 'manage:finance', 'manage:security', 'manage:users']
  },
  'SEC-SALES': {
    profileId: 'SEC-SALES',
    profileName: 'Sales Security',
    description: 'Field & Beat security profile for sales representatives and executives.',
    defaultPolicy: {
      policyId: 'POL-SALES',
      policyName: 'Field Sales Security Policy',
      loginFaceRequirement: 'Required',
      loginGpsRequirement: 'Required',
      otpRequirement: 'Disabled',
      sessionTimeoutMinutes: 60,
      allowedGeofenceRadiusMeters: 250,
      officeHoursOnly: true,
      allowOffline: true
    },
    grantedPermissions: ['read:dashboard', 'manage:sales', 'manage:pricing', 'manage:sfa', 'manage:crm']
  },
  'SEC-WAREHOUSE': {
    profileId: 'SEC-WAREHOUSE',
    profileName: 'Warehouse Security',
    description: 'Operational security profile for warehouse managers and operators.',
    defaultPolicy: {
      policyId: 'POL-WAREHOUSE',
      policyName: 'Depot & Storage Security Policy',
      loginFaceRequirement: 'Required',
      loginGpsRequirement: 'Required',
      otpRequirement: 'Disabled',
      sessionTimeoutMinutes: 45,
      allowedGeofenceRadiusMeters: 100,
      officeHoursOnly: false,
      allowOffline: false
    },
    grantedPermissions: ['read:dashboard', 'manage:warehouse', 'manage:inventory', 'manage:returns', 'manage:logistics']
  },
  'SEC-FINANCE': {
    profileId: 'SEC-FINANCE',
    profileName: 'Finance Security',
    description: 'Financial ledger security profile for accountants and finance managers.',
    defaultPolicy: {
      policyId: 'POL-FINANCE',
      policyName: 'Financial Control Security Policy',
      loginFaceRequirement: 'Disabled',
      loginGpsRequirement: 'Disabled',
      otpRequirement: 'Required',
      sessionTimeoutMinutes: 15,
      allowedGeofenceRadiusMeters: 500,
      officeHoursOnly: false,
      allowOffline: false
    },
    grantedPermissions: ['read:dashboard', 'manage:finance', 'manage:reports', 'manage:o2c', 'manage:procurement']
  },
  'SEC-HR': {
    profileId: 'SEC-HR',
    profileName: 'HR Security',
    description: 'Human resources and payroll security profile.',
    defaultPolicy: {
      policyId: 'POL-HR',
      policyName: 'HR & Payroll Security Policy',
      loginFaceRequirement: 'Optional',
      loginGpsRequirement: 'Disabled',
      otpRequirement: 'Required',
      sessionTimeoutMinutes: 30,
      allowedGeofenceRadiusMeters: 500,
      officeHoursOnly: false,
      allowOffline: false
    },
    grantedPermissions: ['read:dashboard', 'manage:hrms', 'manage:masters']
  },
  'SEC-DRIVER': {
    profileId: 'SEC-DRIVER',
    profileName: 'Driver Security',
    description: 'Logistics fleet and driver mobile security profile.',
    defaultPolicy: {
      policyId: 'POL-DRIVER',
      policyName: 'Fleet & Delivery Security Policy',
      loginFaceRequirement: 'Required',
      loginGpsRequirement: 'Required',
      otpRequirement: 'Disabled',
      sessionTimeoutMinutes: 120,
      allowedGeofenceRadiusMeters: 5000,
      officeHoursOnly: false,
      allowOffline: true
    },
    grantedPermissions: ['read:dashboard', 'manage:logistics']
  },
  'SEC-CUSTOM': {
    profileId: 'SEC-CUSTOM',
    profileName: 'Custom Employee Security Profile',
    description: 'Extensible security profile for future employee types.',
    defaultPolicy: {
      policyId: 'POL-CUSTOM',
      policyName: 'Configurable Dynamic Security Policy',
      loginFaceRequirement: 'Optional',
      loginGpsRequirement: 'Optional',
      otpRequirement: 'Optional',
      sessionTimeoutMinutes: 30,
      allowedGeofenceRadiusMeters: 500,
      officeHoursOnly: false,
      allowOffline: false
    },
    grantedPermissions: ['read:dashboard']
  }
};

export const securityPolicyResolver = {
  /**
   * Resolves the effective Authentication Policy for an employee.
   * Order of Resolution:
   * 1. Employee Override Policy (if useGlobalPolicy === false)
   * 2. Security Profile Default Policy
   * 3. Global System Policy
   */
  resolveAuthenticationPolicy(
    user?: Partial<UserProfile>,
    customSecurityProfile?: SecurityProfile,
    customGlobalPolicy: AuthenticationPolicy = DEFAULT_GLOBAL_POLICY
  ): AuthenticationPolicy {
    if (!user) return customGlobalPolicy;

    // Check if Employee uses Override Policy
    if (user.useGlobalPolicy === false && user.employeeOverridePolicy) {
      const basePolicy = customSecurityProfile?.defaultPolicy ||
        (user.securityProfileId ? ENTERPRISE_SECURITY_PROFILES[user.securityProfileId]?.defaultPolicy : undefined) ||
        customGlobalPolicy;

      return {
        ...basePolicy,
        ...user.employeeOverridePolicy
      };
    }

    // Check if Employee has assigned Security Profile
    if (customSecurityProfile?.defaultPolicy) {
      return customSecurityProfile.defaultPolicy;
    }

    if (user.securityProfileId && ENTERPRISE_SECURITY_PROFILES[user.securityProfileId]) {
      return ENTERPRISE_SECURITY_PROFILES[user.securityProfileId].defaultPolicy;
    }

    if (user.assignedSecurityProfile?.defaultPolicy) {
      return user.assignedSecurityProfile.defaultPolicy;
    }

    // Fallback to Global System Policy
    return customGlobalPolicy;
  },

  /**
   * Resolves dynamic permissions for an employee based on Security Profile
   */
  resolveUserPermissions(
    user?: Partial<UserProfile>,
    customSecurityProfile?: SecurityProfile
  ): string[] {
    if (!user) return [];
    if (user.permissions && user.permissions.length > 0) {
      return user.permissions;
    }

    const profile = customSecurityProfile ||
      (user.securityProfileId ? ENTERPRISE_SECURITY_PROFILES[user.securityProfileId] : undefined) ||
      user.assignedSecurityProfile;

    return profile?.grantedPermissions || [];
  }
};
