import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  Monitor,
  CheckCircle2,
  X,
  AlertCircle,
  Info,
  Sliders,
  Loader2
} from 'lucide-react';
import { UserRole, UserProfile, ToastMessage } from './types';
import EnterpriseLayout from './components/EnterpriseLayout';
import EnterpriseDashboard from './components/EnterpriseDashboard';
import DesignSystemDocs from './components/DesignSystemDocs';
import SecurityPolicyConsole from './components/SecurityPolicyConsole';

// Lazy-loaded Feature Modules
const AuthScreens = lazy(() => import('./features/auth/AuthScreens'));
const MasterDataModule = lazy(() => import('./features/master-data/MasterDataModule'));
const PricingModule = lazy(() => import('./features/pricing/PricingModule'));
const ProcurementModule = lazy(() => import('./features/procurement/ProcurementModule'));
const WarehouseModule = lazy(() => import('./features/warehouse/WarehouseModule'));
const InventoryModule = lazy(() => import('./features/inventory/InventoryModule'));
const SfaModule = lazy(() => import('./features/sfa/SfaModule'));
const O2CModule = lazy(() => import('./features/o2c/O2CModule'));
const ReturnsModule = lazy(() => import('./features/returns/ReturnsModule'));
const FinanceModule = lazy(() => import('./features/finance/FinanceModule'));
const WorkflowModule = lazy(() => import('./features/workflow/WorkflowModule'));
const HrmsModule = lazy(() => import('./features/hrms/HrmsModule'));
const CrmModule = lazy(() => import('./features/crm/CrmModule'));
const LogisticsModule = lazy(() => import('./features/logistics/LogisticsModule'));
const ReportsModule = lazy(() => import('./features/reports/ReportsModule'));
const AdminModule = lazy(() => import('./features/admin/AdminModule'));
const BusinessIntelligenceModule = lazy(() => import('./features/bi/BusinessIntelligenceModule'));
const SupplierModule = lazy(() => import('./features/supplier/SupplierManagementModule'));

function ModuleLoader() {
  return (
    <div className="flex items-center justify-center p-12 space-x-2 text-brand-primary">
      <Loader2 size={24} className="animate-spin" />
      <span className="text-xs font-semibold">Loading Module...</span>
    </div>
  );
}

function MasterDataRouteWrapper({ onTriggerToast }: { onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void }) {
  const { moduleName } = useParams<{ moduleName: string }>();
  return <MasterDataModule module={moduleName || 'products'} onTriggerToast={onTriggerToast} />;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive active view key from location pathname
  const rawPath = location.pathname.startsWith('/') ? location.pathname.slice(1) : location.pathname;
  const activeView = rawPath || 'dashboard';

  // Application User State
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'USR-9021',
    name: 'Siddharth Mehra',
    email: 'admin@ink-fmcg.com',
    role: 'Super Administrator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    branch: 'Delhi Central'
  });

  // Global Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const triggerToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      description: desc
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync route changes
  const handleNavigate = (view: string) => {
    if (view === 'dashboard') navigate('/dashboard');
    else if (view === 'docs') navigate('/docs');
    else if (view === 'admin') navigate('/admin');
    else if (view.startsWith('masters')) navigate(`/${view}`);
    else if (view.startsWith('pricing')) navigate(`/${view}`);
    else if (view.startsWith('procurement')) navigate(`/${view}`);
    else if (view.startsWith('warehouse')) navigate(`/${view}`);
    else if (view.startsWith('inventory')) navigate(`/${view}`);
    else if (view.startsWith('sfa')) navigate(`/${view}`);
    else if (view.startsWith('sales')) navigate(`/${view}`);
    else if (view.startsWith('returns')) navigate(`/${view}`);
    else if (view.startsWith('finance')) navigate(`/${view}`);
    else if (view.startsWith('workflow')) navigate(`/${view}`);
    else if (view.startsWith('hrms')) navigate(`/${view}`);
    else if (view.startsWith('crm')) navigate(`/${view}`);
    else if (view.startsWith('logistics')) navigate(`/${view}`);
    else if (view.startsWith('reports')) navigate(`/${view}`);
    else if (view.startsWith('bi')) navigate(`/${view}`);
    else if (view.startsWith('auth')) navigate(`/${view}`);
    else navigate(`/${view}`);
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
    triggerToast('info', 'Role Switch Triggered', `Active session security permissions re-calibrated for: ${role}`);
  };

  const isAuthRoute = location.pathname.startsWith('/auth');

  if (isAuthRoute) {
    return (
      <Suspense fallback={<ModuleLoader />}>
        <AuthScreens
          onLoginSuccess={(userName, role) => {
            setCurrentUser((prev) => ({ ...prev, name: userName, role: role as UserRole }));
            navigate('/dashboard');
            triggerToast('success', 'Authentication Approved', `Welcome back, ${userName}! Session secured.`);
          }}
          onTriggerToast={triggerToast}
        />
      </Suspense>
    );
  }

  return (
    <>
      <EnterpriseLayout
        activeRole={currentUser.role}
        onRoleChange={handleRoleChange}
        onNavigate={handleNavigate}
        activeView={activeView}
        onTriggerToast={triggerToast}
        user={currentUser}
      >
        <Suspense fallback={<ModuleLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<EnterpriseDashboard onTriggerToast={triggerToast} />} />
            <Route path="/docs" element={<DesignSystemDocs onTriggerToast={triggerToast} />} />
            <Route path="/admin" element={<AdminModule onTriggerToast={triggerToast} />} />
            <Route path="/admin/*" element={<AdminModule onTriggerToast={triggerToast} />} />
            <Route path="/pricing" element={<PricingModule onTriggerToast={triggerToast} />} />
            <Route path="/pricing/*" element={<PricingModule onTriggerToast={triggerToast} />} />
            <Route path="/procurement" element={<ProcurementModule onTriggerToast={triggerToast} />} />
            <Route path="/procurement/suppliers" element={<SupplierModule onTriggerToast={triggerToast} />} />
            <Route path="/procurement/*" element={<ProcurementModule onTriggerToast={triggerToast} />} />
            <Route path="/warehouse" element={<WarehouseModule onTriggerToast={triggerToast} />} />
            <Route path="/warehouse/*" element={<WarehouseModule onTriggerToast={triggerToast} />} />
            <Route path="/inventory" element={<InventoryModule onTriggerToast={triggerToast} />} />
            <Route path="/inventory/*" element={<InventoryModule onTriggerToast={triggerToast} />} />
            <Route path="/sfa" element={<SfaModule onTriggerToast={triggerToast} />} />
            <Route path="/sfa/*" element={<SfaModule onTriggerToast={triggerToast} />} />
            <Route path="/sales" element={<O2CModule onTriggerToast={triggerToast} />} />
            <Route path="/sales/*" element={<O2CModule onTriggerToast={triggerToast} />} />
            <Route path="/returns" element={<ReturnsModule onTriggerToast={triggerToast} />} />
            <Route path="/returns/*" element={<ReturnsModule onTriggerToast={triggerToast} />} />
            <Route path="/finance" element={<FinanceModule onTriggerToast={triggerToast} />} />
            <Route path="/finance/*" element={<FinanceModule onTriggerToast={triggerToast} />} />
            <Route path="/workflow" element={<WorkflowModule onTriggerToast={triggerToast} />} />
            <Route path="/workflow/*" element={<WorkflowModule onTriggerToast={triggerToast} />} />
            <Route path="/hrms" element={<HrmsModule onTriggerToast={triggerToast} />} />
            <Route path="/hrms/*" element={<HrmsModule onTriggerToast={triggerToast} />} />
            <Route path="/crm" element={<CrmModule onTriggerToast={triggerToast} />} />
            <Route path="/crm/*" element={<CrmModule onTriggerToast={triggerToast} />} />
            <Route path="/logistics" element={<LogisticsModule onTriggerToast={triggerToast} />} />
            <Route path="/logistics/*" element={<LogisticsModule onTriggerToast={triggerToast} />} />
            <Route path="/reports" element={<ReportsModule onTriggerToast={triggerToast} />} />
            <Route path="/reports/*" element={<ReportsModule onTriggerToast={triggerToast} />} />
            <Route path="/bi" element={<BusinessIntelligenceModule onTriggerToast={triggerToast} />} />
            <Route path="/bi/*" element={<BusinessIntelligenceModule onTriggerToast={triggerToast} />} />
            <Route path="/masters/:moduleName" element={<MasterDataRouteWrapper onTriggerToast={triggerToast} />} />
            
            {/* Fallback view representing un-built module placeholders */}
            <Route 
              path="*" 
              element={
                <div className="bg-white p-12 text-center rounded-lg border border-brand-border shadow-sm space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center mx-auto">
                    <Sliders size={24} />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-bold text-brand-text-primary">Module Foundation Ready for Backend</h3>
                    <p className="text-xs text-brand-text-secondary">
                      The client requested to only build the Design System & Shell. This placeholder maps perfectly to future ASP.NET Core 9 C# view controllers.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleNavigate('docs')}
                      className="px-4 py-2 border border-brand-border text-brand-text-primary hover:bg-brand-bg-secondary text-xs font-semibold rounded-md transition cursor-pointer"
                    >
                      Inspect Design System
                    </button>
                    <button
                      onClick={() => handleNavigate('dashboard')}
                      className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition cursor-pointer shadow-xs"
                    >
                      Return to Executive Dashboard
                    </button>
                  </div>
                </div>
              } 
            />
          </Routes>
        </Suspense>
      </EnterpriseLayout>

      {/* Floating System Role Simulator */}
      <div className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-md border border-brand-border rounded-lg shadow-xl p-3 max-w-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-text-primary">
            <Monitor size={14} className="text-brand-primary" />
            <span>Role Simulator</span>
          </div>
          <span className="text-[10px] bg-blue-50 text-brand-primary px-1.5 py-0.5 rounded font-mono">Dev Tools</span>
        </div>
        <select
          value={currentUser.role}
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          className="w-full text-xs bg-brand-bg-secondary border border-brand-border rounded px-2 py-1 focus:outline-none focus:border-brand-primary font-medium"
        >
          <option value="Super Administrator">Super Administrator</option>
          <option value="Administrator">Administrator</option>
          <option value="Procurement Manager">Procurement Manager</option>
          <option value="Warehouse Manager">Warehouse Manager</option>
          <option value="Inventory Controller">Inventory Controller</option>
          <option value="Sales Manager">Sales Manager</option>
          <option value="Sales Representative">Sales Representative</option>
          <option value="Finance Manager">Finance Manager</option>
          <option value="Accountant">Accountant</option>
          <option value="Branch Manager">Branch Manager</option>
          <option value="Director">Director</option>
        </select>
      </div>

      {/* Global Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-3 rounded-lg border shadow-lg transition-all animate-slide-in text-xs ${
              toast.type === 'success'
                ? 'bg-white border-green-200 text-brand-text-primary'
                : toast.type === 'error'
                ? 'bg-white border-red-200 text-brand-text-primary'
                : toast.type === 'warning'
                ? 'bg-white border-amber-200 text-brand-text-primary'
                : 'bg-white border-blue-200 text-brand-text-primary'
            }`}
          >
            <div className="flex items-start gap-2">
              {toast.type === 'success' && <CheckCircle2 size={16} className="text-brand-success shrink-0 mt-0.5" />}
              {toast.type === 'error' && <AlertCircle size={16} className="text-brand-danger shrink-0 mt-0.5" />}
              {toast.type === 'warning' && <AlertCircle size={16} className="text-brand-warning shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info size={16} className="text-brand-info shrink-0 mt-0.5" />}
              <div>
                <h4 className="font-bold">{toast.title}</h4>
                {toast.description && <p className="text-brand-text-secondary text-[11px] mt-0.5">{toast.description}</p>}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-brand-text-secondary hover:text-brand-text-primary cursor-pointer p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
