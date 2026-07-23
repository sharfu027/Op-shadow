import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Mail,
  Key,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Clock,
  ShieldCheck,
  Send,
  Camera,
  MapPin,
  RefreshCw,
  Check,
  Compass,
  Fingerprint,
  LockOpen,
  X,
  AlertCircle,
  User,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';

import {
  securityPolicyResolver,
  DEFAULT_GLOBAL_POLICY
} from '../services/securityPolicyResolver';
import { SecurityProfile, AuthenticationPolicy } from '../types/security';

interface AuthScreensProps {
  onLoginSuccess: (userName: string, role: string) => void;
  onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export default function AuthScreens({ onLoginSuccess, onTriggerToast }: AuthScreensProps) {
  const [activeScreen, setActiveScreen] = useState<
    | 'login'
    | 'forgot'
    | 'reset'
    | '2fa'
    | 'expired'
    | 'unauthorized'
    | 'denied'
    | 'face-permission'
    | 'face-scan'
    | 'face-success'
    | 'face-failure'
    | 'gps-permission'
    | 'gps-scan'
    | 'gps-success'
    | 'gps-failure'
    | 'admin-override'
  >('login');

  // Policy-Driven Security Engine States
  // API-Loaded Security Profiles
  const [apiSecurityProfiles] = useState<Record<string, SecurityProfile>>({
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
    }
  });

  // Policy-Driven Security Engine States
  const [selectedSecurityProfileKey, setSelectedSecurityProfileKey] = useState<string>('SEC-ADMIN');
  const [useGlobalPolicy, setUseGlobalPolicy] = useState<boolean>(true);
  const [overrideFaceReq, setOverrideFaceReq] = useState<'Required' | 'Optional' | 'Disabled'>('Required');

  // Resolve Effective Authentication Policy dynamically (No hardcoded roles)
  const activeSecurityProfile = apiSecurityProfiles[selectedSecurityProfileKey] || apiSecurityProfiles['SEC-ADMIN'];
  
  const effectivePolicy: AuthenticationPolicy = securityPolicyResolver.resolveAuthenticationPolicy(
    {
      useGlobalPolicy,
      securityProfileId: selectedSecurityProfileKey,
      employeeOverridePolicy: !useGlobalPolicy ? { loginFaceRequirement: overrideFaceReq } : undefined
    },
    activeSecurityProfile,
    DEFAULT_GLOBAL_POLICY
  );

  // Interactive Form States
  const [email, setEmail] = useState('admin@ink-fmcg.com');
  const [password, setPassword] = useState('EnterpriseSecure2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(59);

  // Password reset helper
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Security Verification Configurations
  const [mockFaceResult, setMockFaceResult] = useState<'success' | 'failure'>('success');
  const [mockGpsResult, setMockGpsResult] = useState<'success' | 'failure'>('success');
  const [sensorMode, setSensorMode] = useState<'real' | 'simulated'>('simulated');

  // Camera stream variables
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [faceProgress, setFaceProgress] = useState(0);

  // GPS coordinates variables
  const [gpsProgress, setGpsProgress] = useState(0);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy: number | null } | null>(null);

  // Admin bypass override code
  const [overrideCode, setOverrideCode] = useState('');
  const [overrideError, setOverrideError] = useState('');
  const [overrideSourceScreen, setOverrideSourceScreen] = useState<'face' | 'gps'>('face');

  // Dynamic status ticks during biometric sweep
  const getFaceStatusText = (progress: number) => {
    if (progress < 20) return 'ACTIVATING PHOTONIC SENSOR...';
    if (progress < 40) return 'BOUNDING BOX RESOLVED (1 FACE DETECTED)...';
    if (progress < 60) return 'LIVENESS ANALYSIS & REFLECTION SWEEP...';
    if (progress < 80) return 'COMPILING 128-POINT FACIAL HASHLIST...';
    if (progress < 100) return 'QUERYING ENCRYPTED ACTIVE DIRECTORY LEDGER...';
    return 'MATCH PROTOCOL COMPLETED.';
  };

  // Dynamic status ticks during GPS geofence audit
  const getGpsStatusText = (progress: number) => {
    if (progress < 25) return 'POLLING GNSS SATELLITE ARRAY...';
    if (progress < 50) return 'RESOLVING LATITUDE/LONGITUDE OFFSET...';
    if (progress < 75) return 'CORRELATING POSITION GEOFENCE BUFFER...';
    if (progress < 100) return 'CALCULATING RADIAL RANGE TO DELHI HQ...';
    return 'GEOGRAPHIC LOCATION SECURED.';
  };

  // OTP Countdown ticks
  useEffect(() => {
    let timer: any = null;
    if (activeScreen === '2fa' && otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [activeScreen, otpCountdown]);

  // Handle Biometric scanning progression
  useEffect(() => {
    let interval: any = null;
    if (activeScreen === 'face-scan') {
      setFaceProgress(0);
      interval = setInterval(() => {
        setFaceProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5; // ~2 seconds scan duration
        });
      }, 100);
    }
    return () => {
      clearInterval(interval);
    };
  }, [activeScreen]);

  // Handle Biometric scan completion side effects
  useEffect(() => {
    if (faceProgress >= 100 && activeScreen === 'face-scan') {
      stopCameraStream();
      if (mockFaceResult === 'success') {
        setActiveScreen('face-success');
        onTriggerToast('success', 'Biometric Signature Match', 'Face matched with 99.82% confidence.');
      } else {
        setActiveScreen('face-failure');
        onTriggerToast('error', 'Biometric Verification Failed', 'Liveness or credential mismatch. Please retry.');
      }
    }
  }, [faceProgress, activeScreen, mockFaceResult, onTriggerToast]);

  // Handle Geofence scanning progression
  useEffect(() => {
    let interval: any = null;
    if (activeScreen === 'gps-scan') {
      setGpsProgress(0);
      interval = setInterval(() => {
        setGpsProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5; // ~2 seconds scan duration
        });
      }, 100);
    }
    return () => {
      clearInterval(interval);
    };
  }, [activeScreen]);

  // Handle Geofence scan completion side effects
  useEffect(() => {
    if (gpsProgress >= 100 && activeScreen === 'gps-scan') {
      if (mockGpsResult === 'success') {
        setActiveScreen('gps-success');
        onTriggerToast('success', 'Geofence Clearance Approved', 'User confirmed within Delhi Depot perimeter.');
      } else {
        setActiveScreen('gps-failure');
        onTriggerToast('error', 'Location Out of Bounds', 'Authorized range violation detected.');
      }
    }
  }, [gpsProgress, activeScreen, mockGpsResult, onTriggerToast]);

  // Stop camera helper
  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Clean up camera stream if component unmounts or activeScreen changes
  useEffect(() => {
    if (activeScreen !== 'face-scan') {
      stopCameraStream();
    }
  }, [activeScreen]);

  const handlePasswordStrength = () => {
    if (!newPassword) return { score: 0, label: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-brand-danger' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-brand-warning' };
    return { score, label: 'Production-Grade Strong', color: 'bg-brand-success' };
  };

  const handleOtpInput = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;
    const nextOtp = [...otp];
    nextOtp[index] = val;
    setOtp(nextOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      onTriggerToast('error', 'Validation Failed', 'Please input credentials.');
      return;
    }

    onTriggerToast('info', 'Credentials Accepted', `Evaluating Policy: ${effectivePolicy.policyName}`);

    // Policy Decision Engine step resolution
    if (effectivePolicy.otpRequirement === 'Required') {
      setActiveScreen('2fa');
    } else if (effectivePolicy.loginFaceRequirement === 'Required') {
      setActiveScreen('face-permission');
    } else if (effectivePolicy.loginGpsRequirement === 'Required') {
      setActiveScreen('gps-permission');
    } else {
      onTriggerToast('success', 'Policy Clearance Approved', 'No additional multi-factor verification required by policy.');
      onLoginSuccess('Security Profile User', activeSecurityProfile.profileName);
    }
  };

  const handle2faSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      onTriggerToast('error', '2FA Incomplete', 'Provide full 6-digit verification code.');
      return;
    }
    onTriggerToast('success', 'OTP Verified', 'Authentication Policy step 1 verified.');

    // Next step in Policy Decision Engine
    if (effectivePolicy.loginFaceRequirement === 'Required') {
      setActiveScreen('face-permission');
    } else if (effectivePolicy.loginGpsRequirement === 'Required') {
      setActiveScreen('gps-permission');
    } else {
      onLoginSuccess('Security Profile User', activeSecurityProfile.profileName);
    }
  };

  // Face scanner permission initiation
  const handleRequestCamera = async () => {
    if (sensorMode === 'simulated') {
      onTriggerToast('info', 'Sandbox Mode', 'Activating high-fidelity biometric visual simulator.');
      setActiveScreen('face-scan');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setActiveScreen('face-scan');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Webcam stream failed', err);
      onTriggerToast('warning', 'Device Camera Unavailable', 'Defaulting to biometric visual simulator fallback.');
      setActiveScreen('face-scan');
    }
  };

  // Location geofence permission initiation
  const handleRequestLocation = () => {
    if (sensorMode === 'simulated') {
      setGpsCoords({
        lat: 28.6139,
        lng: 77.2090,
        accuracy: 8.4
      });
      setActiveScreen('gps-scan');
      onTriggerToast('info', 'Sandbox Mode', 'Activating high-fidelity Geofence sonar locator.');
      return;
    }

    if (!('geolocation' in navigator)) {
      onTriggerToast('error', 'Not Supported', 'Geolocation is not supported by your browser. Defaulting to high-fidelity mock location.');
      setGpsCoords({ lat: 28.6139, lng: 77.2090, accuracy: 12 });
      setActiveScreen('gps-scan');
      return;
    }

    onTriggerToast('info', 'Acquiring GPS Signal', 'Querying browser geolocation...');
    navigator.geolocation.getCurrentPosition(
      position => {
        setGpsCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setActiveScreen('gps-scan');
      },
      error => {
        console.warn('Geolocation query failed, using fallback:', error);
        onTriggerToast('warning', 'GPS Signal Weak', 'Defaulting to high-fidelity Geofence simulation.');
        setGpsCoords({ lat: 28.6139, lng: 77.2090, accuracy: 15 });
        setActiveScreen('gps-scan');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Admin override handler
  const handleAdminOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideCode === '991A' || overrideCode === '2026') {
      onTriggerToast('success', 'Bypass Authorized', 'Override accepted. Audit reference logged.');
      if (overrideSourceScreen === 'face') {
        setActiveScreen('gps-permission');
      } else {
        onLoginSuccess('Siddharth Mehra (Bypass Override)', 'Super Administrator');
      }
    } else {
      setOverrideError('Invalid authorization passcode. Event flagged.');
      onTriggerToast('error', 'Clearance Level Insufficient', 'Bypass rejected.');
    }
  };

  const strength = handlePasswordStrength();

  return (
    <div className="space-y-6">
      {/* Dynamic Keyframe Injection for smooth biometric animations */}
      <style>{`
        @keyframes scan {
          0% { top: 4%; }
          50% { top: 96%; }
          100% { top: 4%; }
        }
        @keyframes sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-scanline {
          animation: scan 3s ease-in-out infinite;
        }
        .animate-radar-sweep {
          animation: sweep 4.5s linear infinite;
        }
      `}</style>

      {/* SECTION 1: DETAILED SIMULATION CONTROL BAR */}
      <div className="bg-white p-5 rounded-lg border border-brand-border shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-brand-primary/10 text-brand-primary">
              <Shield size={16} />
            </span>
            <h2 className="text-sm font-bold text-brand-text-primary">Biometric Attendance & Geofence Simulation Desk</h2>
          </div>
          <p className="text-xs text-brand-text-secondary leading-normal max-w-2xl">
            Test and inspect all required screens of the high-security enterprise sign-in. Use the controls below to toggle biometric match results, GPS geofence checks, or browser sensor modes.
          </p>
        </div>

        {/* HIGH-FIDELITY SANDBOX CONTROLS */}
        <div className="flex flex-wrap items-center gap-4 bg-brand-bg-secondary p-3 border border-brand-border rounded-lg">
          {/* POLICY-DRIVEN SECURITY PROFILE SELECTOR */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-text-primary block uppercase tracking-wider flex items-center gap-1">
              <Shield size={12} className="text-brand-primary" /> Assigned Security Profile
            </span>
            <select
              value={selectedSecurityProfileKey}
              onChange={(e) => {
                setSelectedSecurityProfileKey(e.target.value);
                onTriggerToast('info', 'Security Profile Loaded', `Policy dynamically resolved for: ${apiSecurityProfiles[e.target.value]?.profileName || 'Security Profile'}`);
              }}
              className="p-1.5 border rounded border-brand-border bg-white text-[11px] font-bold text-brand-text-primary"
            >
              <option value="SEC-ADMIN">Admin Security (Face + OTP Required)</option>
              <option value="SEC-SALES">Sales Security (Face + GPS Required, OTP Disabled)</option>
              <option value="SEC-WAREHOUSE">Warehouse Security (Face + GPS Required)</option>
              <option value="SEC-FINANCE">Finance Security (OTP Required, Face Disabled)</option>
              <option value="SEC-HR">HR Security (OTP Required)</option>
              <option value="SEC-DRIVER">Driver Security (Face + GPS Required)</option>
              <option value="SEC-CUSTOM">Custom / Future Employee Profile</option>
            </select>
          </div>

          {/* POLICY OVERRIDE HIERARCHY TOGGLE */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-text-secondary block uppercase tracking-wider">Policy Hierarchy</span>
            <div className="flex bg-white rounded border border-brand-border p-0.5 text-[11px] font-bold">
              <button
                onClick={() => {
                  setUseGlobalPolicy(true);
                  onTriggerToast('info', 'Policy Mode: Global System', 'Using company-wide Security Profile Policy.');
                }}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  useGlobalPolicy ? 'bg-brand-primary text-white shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                Security Profile
              </button>
              <button
                onClick={() => {
                  setUseGlobalPolicy(false);
                  onTriggerToast('warning', 'Policy Mode: Employee Override', 'Employee override policy active.');
                }}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  !useGlobalPolicy ? 'bg-brand-warning text-white shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                Employee Override
              </button>
            </div>
          </div>

          {/* SENSOR CONTROL */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-text-secondary block uppercase tracking-wider">Device Sensors</span>
            <div className="flex bg-white rounded border border-brand-border p-0.5 text-[11px] font-bold">
              <button
                onClick={() => {
                  setSensorMode('simulated');
                  onTriggerToast('info', 'Sensor Mode Changed', 'Now using high-fidelity mock sensor feeds.');
                }}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  sensorMode === 'simulated' ? 'bg-brand-primary text-white shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                Simulated Feed
              </button>
              <button
                onClick={() => {
                  setSensorMode('real');
                  onTriggerToast('warning', 'Requesting Hardware Devices', 'Will prompt browser camera and geolocation.');
                }}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  sensorMode === 'real' ? 'bg-brand-primary text-white shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                Real Webcam/GPS
              </button>
            </div>
          </div>

          {/* FACE SIMULATION RESULT TOGGLE */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-text-secondary block uppercase tracking-wider">Biometric Match Result</span>
            <div className="flex bg-white rounded border border-brand-border p-0.5 text-[11px] font-bold">
              <button
                onClick={() => {
                  setMockFaceResult('success');
                  onTriggerToast('success', 'Biometric Mode: Success', 'Face scan will resolve to MATCH APPROVED.');
                }}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  mockFaceResult === 'success' ? 'bg-emerald-600 text-white shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                Success Pass
              </button>
              <button
                onClick={() => {
                  setMockFaceResult('failure');
                  onTriggerToast('error', 'Biometric Mode: Mismatch', 'Face scan will resolve to MATCH FAILURE.');
                }}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  mockFaceResult === 'failure' ? 'bg-rose-600 text-white shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                Fail Mismatch
              </button>
            </div>
          </div>

          {/* GPS SIMULATION RESULT TOGGLE */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-text-secondary block uppercase tracking-wider">GPS Geofence Bounds</span>
            <div className="flex bg-white rounded border border-brand-border p-0.5 text-[11px] font-bold">
              <button
                onClick={() => {
                  setMockGpsResult('success');
                  onTriggerToast('success', 'Geofence Mode: In-Bounds', 'GPS scan will resolve as within Delhi Central Depot HQ.');
                }}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  mockGpsResult === 'success' ? 'bg-emerald-600 text-white shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                Within Range (Delhi)
              </button>
              <button
                onClick={() => {
                  setMockGpsResult('failure');
                  onTriggerToast('error', 'Geofence Mode: Out of Bounds', 'GPS scan will resolve as 1,740km away in Bengaluru.');
                }}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  mockGpsResult === 'failure' ? 'bg-rose-600 text-white shadow-xs' : 'text-brand-text-secondary hover:text-brand-text-primary'
                }`}
              >
                Out of Range (BLR)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SCREEN JUMPER RAIL FOR STAKEHOLDER DIRECT PREVIEW */}
      <div className="bg-white px-5 py-3 rounded-lg border border-brand-border shadow-sm flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider flex items-center gap-1">
          <Layers size={13} /> Inspect Specific Screen State:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'login', label: '1. Standard Login' },
            { id: '2fa', label: '2. Multi-factor (OTP)' },
            { id: 'face-permission', label: '3. Camera Request' },
            { id: 'face-scan', label: '4. Biometric Sweep' },
            { id: 'face-success', label: '5. Bio Pass' },
            { id: 'face-failure', label: '6. Bio Fail' },
            { id: 'gps-permission', label: '7. Geofence Request' },
            { id: 'gps-scan', label: '8. Radar GPS Sweep' },
            { id: 'gps-success', label: '9. GPS Clear' },
            { id: 'gps-failure', label: '10. GPS Fail' },
            { id: 'admin-override', label: '11. Admin Bypass' },
            { id: 'expired', label: '12. Session Timeout' }
          ].map(screen => (
            <button
              key={screen.id}
              onClick={() => {
                setActiveScreen(screen.id as any);
                onTriggerToast('info', `Preview Screen Active`, `Switched viewport state to: ${screen.label}`);
              }}
              className={`px-2 py-1 rounded text-[11px] font-bold border transition cursor-pointer ${
                activeScreen === screen.id
                  ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                  : 'bg-brand-bg-secondary/40 border-brand-border text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-bg-secondary'
              }`}
            >
              {screen.label}
            </button>
          ))}
        </div>
      </div>

      {/* CORE DISPLAY STAGE */}
      <div className="min-h-[580px] bg-brand-bg-secondary/40 border border-brand-border rounded-xl flex items-center justify-center p-4 relative overflow-hidden shadow-sm">
        
        {/* Abstract blueprint grid background representation */}
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:18px_18px] opacity-40 pointer-events-none" />

        {/* Dynamic Glowing decorative security pulses in the stage background */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-100/20 blur-3xl pointer-events-none" />

        {/* STYLISH PLATFORM SIGN-IN CARD */}
        <div className="relative w-full max-w-md bg-white border border-brand-border rounded-xl shadow-xl p-6 sm:p-8 space-y-6">
          
          {/* Dynamic TOP SECURE BADGE HEADER */}
          <div className="flex justify-between items-center border-b border-brand-border/60 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-brand-primary flex items-center justify-center text-white font-black text-sm shadow-xs">
                I
              </div>
              <div>
                <h3 className="text-xs font-black text-brand-text-primary uppercase tracking-wider">INK FMCG ERP</h3>
                <p className="text-[10px] text-brand-text-secondary font-mono">SECURE ATTENDANCE HUB</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
              <span>SSL_ENCRYPTED</span>
            </div>
          </div>

          {/* ========================================================== */}
          {/* SCREEN 1: PRIMARY CREDENTIAL LOGIN */}
          {/* ========================================================== */}
          {activeScreen === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-brand-text-primary">Corporate Authentication</h4>
                <p className="text-xs text-brand-text-secondary">Please present active Active Directory password clearance.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-brand-text-primary">Corporate Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="text-brand-text-secondary absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-brand-border rounded focus:outline-none focus:border-brand-primary transition bg-white text-brand-text-primary"
                      placeholder="username@ink-fmcg.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-brand-text-primary">Access Password</label>
                    <button
                      type="button"
                      onClick={() => setActiveScreen('forgot')}
                      className="text-[10px] text-brand-primary font-bold hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={14} className="text-brand-text-secondary absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 text-xs border border-brand-border rounded focus:outline-none focus:border-brand-primary transition bg-white text-brand-text-primary"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-brand-text-secondary hover:text-brand-text-primary cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-primary hover:bg-blue-700 text-white font-bold text-xs rounded transition shadow-xs cursor-pointer flex items-center justify-center gap-1"
              >
                Sign In To Platform <ChevronRight size={14} />
              </button>

              <div className="pt-2 border-t border-brand-border text-center">
                <span className="text-[10px] text-brand-text-secondary leading-normal block">
                  Protected by standard JWT security guidelines and OAuth token refresh bounds.
                </span>
              </div>
            </form>
          )}

          {/* ========================================================== */}
          {/* SCREEN 2: PASSWORD FORGOTTEN RECOVERY */}
          {/* ========================================================== */}
          {activeScreen === 'forgot' && (
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => setActiveScreen('login')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline mb-2 cursor-pointer"
                >
                  <ArrowLeft size={12} /> Back to Credentials Sign-In
                </button>
                <h4 className="text-sm font-bold text-brand-text-primary">Reset Security Credentials</h4>
                <p className="text-xs text-brand-text-secondary">Provide your corporate active directory email to receive a secure recovery code.</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-text-primary">Corporate Email Address</label>
                <div className="relative">
                  <Mail size={14} className="text-brand-text-secondary absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-brand-border rounded focus:outline-none focus:border-brand-primary transition bg-white text-brand-text-primary"
                    placeholder="username@ink-fmcg.com"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  onTriggerToast('success', 'Recovery Dispatch Confirmed', 'A security link was delivered to your mailbox.');
                  setActiveScreen('reset');
                }}
                className="w-full py-2.5 bg-brand-primary hover:bg-blue-700 text-white font-bold text-xs rounded transition shadow-xs cursor-pointer"
              >
                Dispatch Reset Voucher
              </button>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 3: RESET PASSWORD */}
          {/* ========================================================== */}
          {activeScreen === 'reset' && (
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => setActiveScreen('forgot')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline mb-2 cursor-pointer"
                >
                  <ArrowLeft size={12} /> Re-trigger Request
                </button>
                <h4 className="text-sm font-bold text-brand-text-primary">Establish New Credentials</h4>
                <p className="text-xs text-brand-text-secondary">Enter a strong, corporate security guideline-compliant password.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-brand-text-primary">New Security Password</label>
                  <div className="relative">
                    <Key size={14} className="text-brand-text-secondary absolute left-3 top-3" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-brand-border rounded focus:outline-none focus:border-brand-primary transition bg-white text-brand-text-primary"
                      placeholder="••••••••••••"
                    />
                  </div>

                  {newPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-brand-text-secondary block">
                        Strength Gauge: <strong>{strength.label}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-brand-text-primary">Confirm Access Password</label>
                  <div className="relative">
                    <Key size={14} className="text-brand-text-secondary absolute left-3 top-3" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-brand-border rounded focus:outline-none focus:border-brand-primary transition bg-white text-brand-text-primary"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (newPassword !== confirmPassword) {
                    onTriggerToast('error', 'Mismatch Detected', 'Access passwords do not match.');
                    return;
                  }
                  onTriggerToast('success', 'Password Updated', 'Return to account sign-in with your new credential.');
                  setActiveScreen('login');
                }}
                className="w-full py-2.5 bg-brand-primary hover:bg-blue-700 text-white font-bold text-xs rounded transition shadow-xs cursor-pointer"
              >
                Lock New Password
              </button>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 4: TWO-FACTOR OTP CHALLENGE */}
          {/* ========================================================== */}
          {activeScreen === '2fa' && (
            <form onSubmit={handle2faSubmit} className="space-y-4">
              <div>
                <button
                  onClick={() => setActiveScreen('login')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline mb-2 cursor-pointer"
                >
                  <ArrowLeft size={12} /> Back to Sign-In
                </button>
                <h4 className="text-sm font-bold text-brand-text-primary">2-Step MFA Code</h4>
                <p className="text-xs text-brand-text-secondary font-medium">Enter the 6-digit corporate verification PIN dispatched to your device.</p>
              </div>

              <div className="flex justify-between gap-2 py-1">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpInput(e.target.value, i)}
                    className="w-11 h-12 text-center text-sm font-black border border-brand-border rounded-md bg-slate-50 focus:outline-none focus:border-brand-primary focus:bg-white transition text-brand-text-primary"
                  />
                ))}
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-brand-text-secondary flex items-center gap-1 font-mono">
                  <Clock size={12} /> PIN expires in {otpCountdown}s
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpCountdown(59);
                    onTriggerToast('info', 'MFA Token Dispatched', 'A new 6-digit access code was dispatched.');
                  }}
                  className="text-brand-primary font-bold hover:underline cursor-pointer"
                >
                  Resend Pin
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-primary hover:bg-blue-700 text-white font-bold text-xs rounded transition shadow-xs cursor-pointer"
              >
                Verify Credentials Code
              </button>
            </form>
          )}

          {/* ========================================================== */}
          {/* SCREEN 5: CAMERA PERMISSION REQUEST */}
          {/* ========================================================== */}
          {activeScreen === 'face-permission' && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
                  <Camera size={26} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brand-primary bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 inline-block font-mono">
                    STEP 1 OF 2: BIOMETRIC SECURITY
                  </span>
                  <h4 className="text-sm font-bold text-brand-text-primary">Facial Attendance Scan</h4>
                  <p className="text-xs text-brand-text-secondary max-w-sm mx-auto">
                    To satisfy corporate security, verify your identity using our real-time biometric liveness audit.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-brand-border/60 text-left space-y-2">
                <h5 className="text-[10px] font-bold text-brand-text-primary uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={13} className="text-brand-success" /> Biometric Audit Compliance
                </h5>
                <ul className="text-[10px] text-brand-text-secondary space-y-1.5 leading-normal">
                  <li className="flex items-start gap-1">
                    <Check size={11} className="text-brand-success shrink-0 mt-0.5" />
                    <span><strong>Active Liveness:</strong> Analyzes face contour and reflection models.</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check size={11} className="text-brand-success shrink-0 mt-0.5" />
                    <span><strong>Privacy Secure:</strong> Biometric vectors are calculated client-side. No images saved.</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check size={11} className="text-brand-success shrink-0 mt-0.5" />
                    <span><strong>Compliance Audited:</strong> Fits active ISO/IEC 27001 data center credentials.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleRequestCamera}
                  className="w-full py-2.5 bg-brand-primary hover:bg-blue-700 text-white font-bold text-xs rounded transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Camera size={14} /> Allow Camera & Start Biometric Scan
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setOverrideSourceScreen('face');
                      setActiveScreen('admin-override');
                      onTriggerToast('info', 'Bypass Invoked', 'Requires supervisory override passcode.');
                    }}
                    className="flex-1 py-2 border border-brand-border text-brand-text-primary hover:bg-slate-50 text-[11px] font-bold rounded transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ShieldAlert size={12} className="text-amber-500" /> Admin Override
                  </button>
                  <button
                    onClick={() => setActiveScreen('login')}
                    className="px-3 py-2 border border-brand-border text-brand-text-secondary hover:text-brand-text-primary text-[11px] font-bold rounded transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 6: CAMERA BIOMETRIC SCANNING (PROGRESS & PREVIEW) */}
          {/* ========================================================== */}
          {activeScreen === 'face-scan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h4 className="text-xs font-black text-brand-text-primary uppercase tracking-wider">Liveness Sensor Capture</h4>
                  <p className="text-[10px] text-brand-text-secondary">Keep face centered within frame guides.</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-brand-primary animate-pulse bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  CAPTURING
                </span>
              </div>

              {/* CAMERA PREVIEW VIEWPORT CONTAINER */}
              <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-xl border-2 border-brand-border/80 bg-slate-950 overflow-hidden shadow-lg">
                {/* 1. Video Element for real camera stream */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover scale-x-[-1] absolute inset-0 ${
                    sensorMode === 'simulated' ? 'hidden' : 'block'
                  }`}
                />

                {/* 2. High-Fidelity Vector Biometric Scanning Silhouette (for simulated fallback or sensorMode: simulated) */}
                {sensorMode === 'simulated' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                    {/* Glowing mesh nodes */}
                    <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1.5px,transparent_1.5px)] [background-size:14px_14px] opacity-25" />
                    
                    {/* Abstract digital face mesh silhouette */}
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-brand-primary/40">
                        {/* Outline */}
                        <path d="M 50,15 C 30,15 22,30 22,55 C 22,75 35,85 50,85 C 65,85 78,75 78,55 C 78,30 70,15 50,15 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-pulse" />
                        {/* Tech circles */}
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(37,99,235,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
                        <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(37,99,235,0.2)" strokeWidth="0.5" />
                        {/* Eyes */}
                        <circle cx="38" cy="45" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
                        <circle cx="62" cy="45" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
                        {/* Center axis */}
                        <line x1="50" y1="15" x2="50" y2="85" stroke="rgba(37,99,235,0.1)" strokeWidth="0.5" strokeDasharray="1 3" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* 3. High-Tech Green/Blue Facial Landmark tracking dots */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Outer corner focus reticles */}
                  <div className="absolute top-3 left-3 border-t-2 border-l-2 border-brand-primary w-5 h-5 rounded-tl" />
                  <div className="absolute top-3 right-3 border-t-2 border-r-2 border-brand-primary w-5 h-5 rounded-tr" />
                  <div className="absolute bottom-3 left-3 border-b-2 border-l-2 border-brand-primary w-5 h-5 rounded-bl" />
                  <div className="absolute bottom-3 right-3 border-b-2 border-r-2 border-brand-primary w-5 h-5 rounded-br" />

                  {/* Facial landmark tracker overlay dots (eyes, nose, mouth, bounding box) */}
                  <div className="absolute top-[22%] left-[22%] right-[22%] bottom-[18%] border border-emerald-500/50 rounded-2xl animate-pulse">
                    <span className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center text-[7px] text-black font-mono font-black scale-75 shadow-sm">A</span>
                    <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center text-[7px] text-black font-mono font-black scale-75 shadow-sm">B</span>
                  </div>

                  {/* Landmark nodes representing actual biometric detection coordinate tracking */}
                  <div className="absolute top-[44%] left-[38%] w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_4px_#34d399] animate-ping" />
                  <div className="absolute top-[44%] left-[38%] w-1.5 h-1.5 bg-emerald-500 rounded-full" />

                  <div className="absolute top-[44%] right-[38%] w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_4px_#34d399] animate-ping" />
                  <div className="absolute top-[44%] right-[38%] w-1.5 h-1.5 bg-emerald-500 rounded-full" />

                  <div className="absolute top-[56%] left-[50%] -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_4px_#34d399]" />
                  <div className="absolute top-[68%] left-[50%] -translate-x-1/2 w-6 h-1 border-b-2 border-emerald-400 rounded-full shadow-[0_0_4px_#34d399]" />

                  {/* Continuous moving scan laser line */}
                  <div className="absolute left-3 right-3 h-0.5 bg-emerald-400 opacity-75 shadow-[0_0_8px_#34d399] animate-scanline" />

                  {/* Corner stats readout overlays */}
                  <span className="absolute top-4 left-4 text-[7px] font-mono font-bold text-brand-primary bg-slate-900/70 px-1 py-0.2 rounded">
                    LIVENESS: TRUE
                  </span>
                  <span className="absolute top-4 right-4 text-[7px] font-mono font-bold text-brand-primary bg-slate-900/70 px-1 py-0.2 rounded">
                    MATCH: {faceProgress}%
                  </span>
                  <span className="absolute bottom-4 left-4 text-[7px] font-mono font-bold text-brand-primary bg-slate-900/70 px-1 py-0.2 rounded">
                    REF_CLK: UTC+5:30
                  </span>
                  <span className="absolute bottom-4 right-4 text-[7px] font-mono font-bold text-emerald-400 bg-slate-900/70 px-1 py-0.2 rounded">
                    FPS: 30 / ISO: 200
                  </span>
                </div>
              </div>

              {/* PROGRESS STATUS & INDICATOR */}
              <div className="space-y-2 max-w-[280px] mx-auto text-center">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-brand-text-secondary">
                  <span className="text-left overflow-hidden text-ellipsis whitespace-nowrap pr-2">
                    {getFaceStatusText(faceProgress)}
                  </span>
                  <span className="text-brand-primary">{faceProgress}%</span>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-brand-border/40">
                  <div
                    className="h-full bg-brand-primary transition-all duration-100 rounded-full shadow-xs"
                    style={{ width: `${faceProgress}%` }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    setActiveScreen('face-permission');
                  }}
                  className="px-3 py-1 border border-brand-border text-brand-text-secondary hover:text-brand-text-primary hover:bg-slate-50 text-[10px] font-bold rounded transition cursor-pointer"
                >
                  Cancel Scanner Access
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 7: FACE MATCH SUCCESS SCREEN */}
          {/* ========================================================== */}
          {activeScreen === 'face-success' && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 text-brand-success flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={28} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-brand-success bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 inline-block uppercase">
                    BIOMETRIC SIGNATURE VERIFIED
                  </span>
                  <h4 className="text-sm font-bold text-brand-text-primary">Identity Securely Cleared</h4>
                  <p className="text-xs text-brand-text-secondary">Active AD matching protocol completed with complete confidence.</p>
                </div>
              </div>

              {/* MATCH DATA BLOCK */}
              <div className="bg-slate-50 rounded-lg p-3.5 border border-brand-border text-xs flex gap-3.5 items-center">
                <div className="w-12 h-12 rounded-full bg-slate-200 border border-brand-border overflow-hidden shrink-0 flex items-center justify-center relative">
                  {/* Simulated Profile snapshot */}
                  <User size={24} className="text-slate-500" />
                  <div className="absolute inset-0 bg-brand-primary/5 border border-brand-primary/20 rounded-full" />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-brand-text-primary truncate block text-[13px]">Siddharth Mehra</span>
                    <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">
                      99.8% CONF
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-brand-text-secondary">
                    <p>ID: <span className="font-mono text-brand-text-primary">EMP-2026-90A</span></p>
                    <p>ROLE: <span className="font-semibold text-brand-text-primary">Super Admin</span></p>
                    <p className="col-span-2">LEDGER NODE: <span className="font-mono text-brand-text-primary">HQ Delhi Central Depot</span></p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (effectivePolicy.loginGpsRequirement === 'Required') {
                    setActiveScreen('gps-permission');
                  } else {
                    onTriggerToast('success', 'Authentication Completed', 'Policy requirements satisfied.');
                    onLoginSuccess('Security Profile User', activeSecurityProfile.profileName);
                  }
                }}
                className="w-full py-2.5 bg-brand-primary hover:bg-blue-700 text-white font-bold text-xs rounded transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {effectivePolicy.loginGpsRequirement === 'Required' ? 'Proceed to Location Geofence Check' : 'Complete Login & Enter ERP Dashboard'} <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 8: FACE MATCH FAILURE SCREEN (WITH RETRIES & OVERRIDES) */}
          {/* ========================================================== */}
          {activeScreen === 'face-failure' && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 text-brand-danger flex items-center justify-center mx-auto shadow-xs">
                  <ShieldAlert size={28} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-brand-danger bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 inline-block uppercase">
                    BIOMETRIC REJECTED
                  </span>
                  <h4 className="text-sm font-bold text-brand-text-primary">Face Recognition Failed</h4>
                  <p className="text-xs text-brand-text-secondary">The biometric signature did not correspond to any registered credentials.</p>
                </div>
              </div>

              {/* RETRY TROUBLESHOOTING GUIDE */}
              <div className="p-3 bg-slate-50 border border-brand-border rounded-lg text-left text-xs space-y-2">
                <h5 className="text-[10px] font-bold text-brand-text-primary uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle size={13} className="text-brand-warning" /> Biometric Capture Troubleshooter
                </h5>
                <ul className="text-[10px] text-brand-text-secondary space-y-1.5 list-disc list-inside leading-normal">
                  <li><strong>Luminance constraints:</strong> Adjust room light for optimal contrast.</li>
                  <li><strong>Pose alignment:</strong> Face directly forward within the guiding bounding box.</li>
                  <li><strong>Obstructions:</strong> Remove any reflective eyeglasses, face masks, or caps.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveScreen('face-scan');
                  }}
                  className="w-full py-2.5 bg-brand-primary hover:bg-blue-700 text-white font-bold text-xs rounded transition shadow-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <RefreshCw size={13} /> Retry Biometric Facial Scan
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setOverrideSourceScreen('face');
                      setActiveScreen('admin-override');
                      onTriggerToast('info', 'Invoking Bypass Credentials', 'Provide authorization code.');
                    }}
                    className="flex-1 py-2 border border-brand-border text-brand-text-primary hover:bg-slate-50 text-[11px] font-bold rounded transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ShieldAlert size={12} className="text-amber-500" /> Admin Override
                  </button>
                  <button
                    onClick={() => {
                      setMockFaceResult('success');
                      setActiveScreen('face-scan');
                      onTriggerToast('info', 'Sandbox Overrides', 'Face scanning forced to SUCCESS for sandbox testing.');
                    }}
                    className="px-3.5 py-2 border border-brand-border text-brand-text-secondary hover:text-brand-text-primary text-[11px] font-bold rounded transition cursor-pointer"
                  >
                    Force Success
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 9: GPS GEOFENCE PERMISSION REQUEST */}
          {/* ========================================================== */}
          {activeScreen === 'gps-permission' && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
                  <MapPin size={26} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-brand-primary bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 inline-block">
                    STEP 2 OF 2: GEOGRAPHIC LOCATION
                  </span>
                  <h4 className="text-sm font-bold text-brand-text-primary">Geofence Attendance Check</h4>
                  <p className="text-xs text-brand-text-secondary max-w-sm mx-auto">
                    Corporate audit rules restrict ledger login synchronization to authorized depot boundaries.
                  </p>
                </div>
              </div>

              {/* RADIUS RANGE EXPLANATION */}
              <div className="p-3 bg-slate-50 rounded-lg border border-brand-border/60 text-left space-y-2">
                <h5 className="text-[10px] font-bold text-brand-text-primary uppercase tracking-wider flex items-center gap-1">
                  <Compass size={13} className="text-brand-primary" /> Geofence Clearance Details
                </h5>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-brand-text-secondary">
                  <div className="bg-white p-2 rounded border border-brand-border/50">
                    <p className="font-bold text-brand-text-primary">Authorized Radius</p>
                    <p className="mt-0.5 font-mono">150 meters</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-brand-border/50">
                    <p className="font-bold text-brand-text-primary">Center Anchor</p>
                    <p className="mt-0.5 truncate">Delhi Central Depot</p>
                  </div>
                </div>
                <p className="text-[9px] text-brand-text-secondary leading-normal">
                  Your physical coordinates will be mapped client-side against the corporate attendance radius. Security logs will record compliance metadata.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleRequestLocation}
                  className="w-full py-2.5 bg-brand-primary hover:bg-blue-700 text-white font-bold text-xs rounded transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MapPin size={14} /> Allow Location & Start Geofence Check
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setOverrideSourceScreen('gps');
                      setActiveScreen('admin-override');
                      onTriggerToast('info', 'Bypass Invoked', 'Requires supervisory override passcode.');
                    }}
                    className="flex-1 py-2 border border-brand-border text-brand-text-primary hover:bg-slate-50 text-[11px] font-bold rounded transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ShieldAlert size={12} className="text-amber-500" /> Admin Override
                  </button>
                  <button
                    onClick={() => setActiveScreen('face-success')}
                    className="px-3.5 py-2 border border-brand-border text-brand-text-secondary hover:text-brand-text-primary text-[11px] font-bold rounded transition cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 10: GPS LOCATION VERIFICATION GEOFENCE RADAR SCAN */}
          {/* ========================================================== */}
          {activeScreen === 'gps-scan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h4 className="text-xs font-black text-brand-text-primary uppercase tracking-wider">Geofence Radar Sync</h4>
                  <p className="text-[10px] text-brand-text-secondary">Establishing secure satellite position coordinates...</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-brand-primary animate-pulse bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  LOCKING GPS
                </span>
              </div>

              {/* CONCENTRIC RADAR ANIMATION DISPLAY */}
              <div className="relative w-full aspect-square max-w-[220px] mx-auto bg-slate-950 rounded-full border border-brand-border/40 overflow-hidden flex items-center justify-center shadow-md">
                
                {/* Sonar sweep gradient sector rotating */}
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(37,99,235,0.15),transparent)] rounded-full animate-radar-sweep pointer-events-none" />

                {/* Radar target grids */}
                <div className="absolute w-4/5 h-4/5 border border-brand-primary/10 rounded-full" />
                <div className="absolute w-3/5 h-3/5 border border-brand-primary/20 rounded-full" />
                <div className="absolute w-2/5 h-2/5 border border-brand-primary/35 rounded-full border-dashed" />
                <div className="absolute w-1/5 h-1/5 border border-brand-primary/40 rounded-full" />

                {/* Axis Crosshairs */}
                <div className="absolute inset-x-0 h-0.5 bg-brand-primary/5 pointer-events-none" />
                <div className="absolute inset-y-0 w-0.5 bg-brand-primary/5 pointer-events-none" />

                {/* Secure depot hub blip (center marker) */}
                <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_8px_#10b981] z-10">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </div>
                <span className="absolute top-[42%] left-[53%] text-[6px] font-mono font-bold text-emerald-400">
                  DELHI_HQ
                </span>

                {/* User position blip (sweeping radar) */}
                <div className={`absolute w-2 h-2 rounded-full z-10 transition-all duration-1000 ${
                  mockGpsResult === 'success' 
                    ? 'bg-brand-primary top-[44%] left-[42%] shadow-[0_0_6px_#2563eb]' 
                    : 'bg-rose-500 top-[22%] left-[18%] shadow-[0_0_6px_#f43f5e] animate-pulse'
                }`} />

                {/* Radial swept text overlay */}
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-mono font-semibold text-brand-primary bg-slate-900/80 px-1.5 py-0.5 rounded tracking-wide">
                  RANGE: {mockGpsResult === 'success' ? '42 METERS' : '1,740 KM'}
                </span>
              </div>

              {/* STATUS INDICATORS */}
              <div className="space-y-2 max-w-[240px] mx-auto text-center">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-brand-text-secondary">
                  <span className="text-left overflow-hidden text-ellipsis whitespace-nowrap pr-2">
                    {getGpsStatusText(gpsProgress)}
                  </span>
                  <span className="text-brand-primary">{gpsProgress}%</span>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-brand-border/40">
                  <div
                    className="h-full bg-brand-primary transition-all duration-100 rounded-full shadow-xs"
                    style={{ width: `${gpsProgress}%` }}
                  />
                </div>

                {gpsCoords && (
                  <div className="bg-slate-50 p-2 rounded border border-brand-border/60 font-mono text-[9px] text-brand-text-secondary grid grid-cols-2 text-left gap-1">
                    <p>LAT: <span className="font-bold text-brand-text-primary">{gpsCoords.lat.toFixed(4)}° N</span></p>
                    <p>LNG: <span className="font-bold text-brand-text-primary">{gpsCoords.lng.toFixed(4)}° E</span></p>
                    <p className="col-span-2">ACCURACY: <span className="font-bold text-brand-text-primary">+/- {gpsCoords.accuracy ? gpsCoords.accuracy.toFixed(1) + 'm' : '12m'}</span></p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveScreen('gps-permission');
                  }}
                  className="px-3 py-1 border border-brand-border text-brand-text-secondary hover:text-brand-text-primary hover:bg-slate-50 text-[10px] font-bold rounded transition cursor-pointer"
                >
                  Cancel Geofence Sync
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 11: GPS SUCCESS SCREEN */}
          {/* ========================================================== */}
          {activeScreen === 'gps-success' && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 text-brand-success flex items-center justify-center mx-auto shadow-xs">
                  <Compass size={28} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-brand-success bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 inline-block uppercase">
                    GEOFENCE CLEARANCE APPROVED
                  </span>
                  <h4 className="text-sm font-bold text-brand-text-primary">Coordinates Verified</h4>
                  <p className="text-xs text-brand-text-secondary">Your detected position is within the authorized active work buffer.</p>
                </div>
              </div>

              {/* TELEMETRY RESULTS SUMMARY */}
              <div className="bg-slate-50 border border-brand-border rounded-lg p-3.5 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-1.5 font-mono">
                  <span className="text-brand-text-secondary">Attendance Geo-node</span>
                  <span className="font-bold text-brand-text-primary">Delhi Depot [HQ]</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5 font-mono">
                  <span className="text-brand-text-secondary">Position Coordinates</span>
                  <span className="font-bold text-brand-text-primary">28.6139° N, 77.2090° E</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5 font-mono">
                  <span className="text-brand-text-secondary">Radar Radial Range</span>
                  <span className="font-bold text-emerald-600">42 meters (Compliant)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-brand-text-secondary">Attendance Status</span>
                  <span className="font-bold text-brand-success">Clock-In Permitted</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onTriggerToast('success', 'Attendance Signed In', 'Biometric & location policy clearance verified.');
                  onLoginSuccess('Security Profile User', activeSecurityProfile.profileName);
                }}
                className="w-full py-2.5 bg-brand-primary hover:bg-blue-700 text-white font-bold text-xs rounded transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                Sign Attendance & Access Dashboard <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 12: GPS FAILURE SCREEN (WITH RETRIES & OVERRIDES) */}
          {/* ========================================================== */}
          {activeScreen === 'gps-failure' && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 text-brand-danger flex items-center justify-center mx-auto shadow-xs">
                  <Compass size={28} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-brand-danger bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 inline-block uppercase">
                    GEOFENCE CLEARANCE REJECTED
                  </span>
                  <h4 className="text-sm font-bold text-brand-text-primary">Out of Authorized Area</h4>
                  <p className="text-xs text-brand-text-secondary">We detected access credentials being executed outside the approved corporate geofence range.</p>
                </div>
              </div>

              {/* RANGE EXPLANATORY ALERTS */}
              <div className="p-3.5 bg-slate-50 border border-brand-border rounded-lg text-left text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-brand-danger font-bold text-[10px] uppercase">
                  <AlertCircle size={13} /> GEOFENCE BOUNDS VIOLATION
                </div>
                <div className="space-y-1.5 text-[10px] text-brand-text-secondary leading-normal font-mono">
                  <p>DETECTED COORDS: <span className="font-bold text-brand-text-primary">12.9716° N, 77.5946° E</span></p>
                  <p>TARGET DEPOT CENTER: <span className="font-bold text-brand-text-primary">Delhi Central [HQ]</span></p>
                  <p>DISTANCE TO BOUNDARY: <span className="font-bold text-brand-danger">1,740 km (Max limit: 150m)</span></p>
                </div>
                <p className="text-[9px] text-brand-text-secondary pt-1 leading-normal border-t">
                  Attendance log synchronization has been locked. You must physically report within Delhi Central or request a supervisory override passcode.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveScreen('gps-scan');
                  }}
                  className="w-full py-2.5 bg-brand-primary hover:bg-blue-700 text-white font-bold text-xs rounded transition shadow-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <RefreshCw size={13} /> Re-evaluate GPS Position
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setOverrideSourceScreen('gps');
                      setActiveScreen('admin-override');
                      onTriggerToast('info', 'Invoking Bypass Credentials', 'Provide authorization code.');
                    }}
                    className="flex-1 py-2 border border-brand-border text-brand-text-primary hover:bg-slate-50 text-[11px] font-bold rounded transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <ShieldAlert size={12} className="text-amber-500" /> Admin Override
                  </button>
                  <button
                    onClick={() => {
                      setMockGpsResult('success');
                      setActiveScreen('gps-scan');
                      onTriggerToast('info', 'Sandbox Overrides', 'Geofence test coordinates forced to compliant Delhi HQ.');
                    }}
                    className="px-3.5 py-2 border border-brand-border text-brand-text-secondary hover:text-brand-text-primary text-[11px] font-bold rounded transition cursor-pointer"
                  >
                    Force Compliant
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 13: MANUAL VERIFICATION (ADMINISTRATOR OVERRIDE) */}
          {/* ========================================================== */}
          {activeScreen === 'admin-override' && (
            <form onSubmit={handleAdminOverrideSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-brand-primary">
                  <ShieldAlert size={18} className="text-amber-500 animate-pulse" />
                  <h4 className="text-sm font-bold text-brand-text-primary">Supervisory Access Bypass</h4>
                </div>
                <p className="text-xs text-brand-text-secondary leading-normal">
                  Requires supervisory Active Directory passcode clearance. System-level bypasses will trigger a high-priority incident log on PostgreSQL.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-brand-text-primary">Supervisory Clearance PIN / Key</label>
                  <div className="relative">
                    <Key size={14} className="text-brand-text-secondary absolute left-3 top-3.5" />
                    <input
                      type="password"
                      required
                      value={overrideCode}
                      onChange={e => {
                        setOverrideCode(e.target.value);
                        setOverrideError('');
                      }}
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-brand-border rounded focus:outline-none focus:border-brand-primary bg-slate-50 focus:bg-white transition text-center font-black tracking-widest text-brand-text-primary"
                      placeholder="••••"
                    />
                  </div>
                  {overrideError && (
                    <span className="text-[10px] text-brand-danger font-bold block mt-1">
                      {overrideError}
                    </span>
                  )}
                  <span className="text-[10px] text-brand-text-secondary block mt-1.5 leading-normal bg-amber-50 p-2 rounded border border-amber-100 text-amber-800">
                    💡 Sandbox Test Passcodes: Input <strong>991A</strong> or <strong>2026</strong> to authorize supervisory bypass instantly.
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-primary hover:bg-blue-700 text-white font-bold text-xs rounded transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LockOpen size={13} /> Authorize Security Override
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOverrideCode('');
                    setOverrideError('');
                    if (overrideSourceScreen === 'face') {
                      setActiveScreen('face-failure');
                    } else {
                      setActiveScreen('gps-failure');
                    }
                  }}
                  className="w-full py-2 border border-brand-border text-brand-text-secondary hover:text-brand-text-primary hover:bg-slate-50 text-[11px] font-bold rounded transition cursor-pointer"
                >
                  Return to Scan Failure
                </button>
              </div>
            </form>
          )}

          {/* ========================================================== */}
          {/* SCREEN 14: SESSION EXPIRED GATEWAY */}
          {/* ========================================================== */}
          {activeScreen === 'expired' && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-brand-warning flex items-center justify-center mx-auto border border-amber-100">
                <Clock size={20} className="animate-pulse" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-brand-text-primary">ERP Security Session Expired</h4>
                <p className="text-xs text-brand-text-secondary mt-1 max-w-xs mx-auto">
                  Your JWT access token timed out. Present credentials to extend your active timesheet.
                </p>
              </div>

              <div className="space-y-1 max-w-xs mx-auto">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="PIN code (e.g. 1234)"
                  className="w-full text-center px-3 py-2.5 text-xs border border-brand-border rounded bg-white focus:outline-none focus:border-brand-primary text-brand-text-primary font-bold"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveScreen('login')}
                  className="flex-1 py-1.5 border border-brand-border rounded text-xs text-brand-text-primary bg-white hover:bg-brand-bg-secondary transition cursor-pointer"
                >
                  Switch Account
                </button>
                <button
                  onClick={() => {
                    onTriggerToast('success', 'Token renewed', 'JWT token refresh cycle approved.');
                    setActiveScreen('face-permission');
                  }}
                  className="flex-1 py-1.5 bg-brand-primary hover:bg-blue-700 text-white rounded text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Extend Session
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 15: ACCESS UNAUTHORIZED (401) */}
          {/* ========================================================== */}
          {activeScreen === 'unauthorized' && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-brand-danger flex items-center justify-center mx-auto border border-red-100">
                <ShieldAlert size={20} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-brand-text-primary">401 Access Unauthorized</h4>
                <p className="text-xs text-brand-text-secondary mt-1">
                  Your simulated role does not maintain active Active Directory access tokens.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-brand-border rounded text-left">
                <h5 className="text-[10px] font-bold text-brand-text-primary uppercase mb-1">Attendance Inquiries</h5>
                <ul className="text-[10px] text-brand-text-secondary space-y-1 list-disc list-inside">
                  <li>Verify system administrator security clearances</li>
                  <li>Inquire with Delhi HR about timesheet node mapping</li>
                </ul>
              </div>

              <button
                onClick={() => setActiveScreen('login')}
                className="w-full py-2 border border-brand-border bg-white hover:bg-brand-bg-secondary text-xs text-brand-text-primary font-bold rounded transition cursor-pointer"
              >
                Sign In With Different Role
              </button>
            </div>
          )}

          {/* ========================================================== */}
          {/* SCREEN 16: ACCESS DENIED POLICY BLOCK (403) */}
          {/* ========================================================== */}
          {activeScreen === 'denied' && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-brand-danger flex items-center justify-center mx-auto animate-pulse">
                <AlertTriangle size={20} />
              </div>

              <div>
                <h4 className="text-sm font-bold text-brand-text-primary">403 Access Policy Blocked</h4>
                <p className="text-xs text-brand-text-secondary mt-1">
                  Geofence or Biometric violation logged as high priority policy incident. Access disabled.
                </p>
              </div>

              <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-[10px] text-left leading-normal space-y-1">
                <p>INCIDENT CODE: INC-2026-991A</p>
                <p>ACCESS NODE: Delhi Central Depot</p>
                <p>POLICY BLOCK: Biometric/Geofence Audit Breach</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onTriggerToast('success', 'Incident Escalated', 'Incident log ticket INC-2026-991A dispatched.');
                    setActiveScreen('login');
                  }}
                  className="flex-1 py-1.5 border border-brand-border rounded text-xs text-brand-text-primary bg-white hover:bg-brand-bg-secondary transition cursor-pointer"
                >
                  Log Security Ticket
                </button>
                <button
                  onClick={() => setActiveScreen('login')}
                  className="flex-1 py-1.5 bg-brand-danger hover:bg-red-700 text-white rounded text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Return to Login
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
