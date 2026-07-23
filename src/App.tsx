import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  Monitor,
  CheckCircle2,
  X,
  AlertCircle,
  Info,
  Sliders
} from 'lucide-react';
import { UserRole, UserProfile, ToastMessage } from './types';
import EnterpriseLayout from './components/EnterpriseLayout';
import EnterpriseDashboard from './components/EnterpriseDashboard';
import DesignSystemDocs from './components/DesignSystemDocs';
import AuthScreens from './components/AuthScreens';
import MasterDataModule from './components/MasterDataModule';
import SecurityPolicyConsole from './components/SecurityPolicyConsole';
import PricingModule from './features/pricing/PricingModule';
import ProcurementModule from './features/procurement/ProcurementModule';
import WarehouseModule from './features/warehouse/WarehouseModule';
import InventoryModule from './features/inventory/InventoryModule';
import SfaModule from './features/sfa/SfaModule';
import O2CModule from './features/o2c/O2CModule';
import ReturnsModule from './features/returns/ReturnsModule';
import FinanceModule from './features/finance/FinanceModule';
import WorkflowModule from './features/workflow/WorkflowModule';

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

  // Global simulated active user state
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'USR-0201A',
    name: 'Siddharth Mehra',
    email: 'siddharth.mehra@ink-fmcg.com',
    role: 'Super Administrator',
    branch: 'Delhi Central Depot [HQ]'
  });

  const [responsiveLabel, setResponsiveLabel] = useState<string>('Desktop Mode');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast dispatch handler
  const triggerToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, description: desc, type };
    setToasts(prev => [newToast, ...prev]);

    // Clear after 4s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Switch role simulation
  const handleRoleChange = (role: UserRole) => {
    setCurrentUser(prev => ({
      ...prev,
      role
    }));
  };

  const handleNavigate = (viewId: string) => {
    navigate('/' + viewId);
  };

  // Detect and set responsive width indicators for stakeholders testing mobile layouts
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1440) setResponsiveLabel('Ultra-wide Monitor Grid (1440px+)');
      else if (w >= 1024) setResponsiveLabel('Laptop & Desktop Container (1024px+)');
      else if (w >= 768) setResponsiveLabel('Tablet Interface (768px - 1023px)');
      else setResponsiveLabel('Mobile Optimization Viewport (Under 768px)');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen relative bg-brand-bg-secondary text-brand-text-primary antialiased">
      
      {/* PERSISTENT PORTAL UTILITY BANNER (FOR STAKEHOLDERS TESTING SHELL) */}
      <div className="bg-brand-text-primary text-white text-[11px] px-4 py-2 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0 z-50 relative">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse shrink-0" />
          <span className="font-semibold font-mono uppercase tracking-wider">INK FMCG ERP</span>
          <span className="text-brand-text-secondary">|</span>
          <span className="text-gray-300">Enterprise Sales & Distribution</span>
        </div>

        {/* Workspace Mode switch triggers */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-gray-300">
            <Monitor size={12} />
            <span className="font-medium text-[10px] mr-1">{responsiveLabel}</span>
          </div>

          <div className="flex bg-brand-bg-primary/10 rounded p-0.5 border border-white/10 text-[10px] font-bold">
            <button
              onClick={() => {
                handleNavigate('dashboard');
                triggerToast('info', 'Workspace loaded', 'FMCG Executive metrics dashboard active.');
              }}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                activeView === 'dashboard' ? 'bg-brand-primary text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              1. Executive Dashboard
            </button>
            <button
              onClick={() => {
                handleNavigate('docs');
                triggerToast('success', 'Design Docs active', 'Component Catalog loaded.');
              }}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                activeView === 'docs' ? 'bg-brand-primary text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              2. Design System & Component library
            </button>
            <button
              onClick={() => {
                handleNavigate('auth/login');
                triggerToast('warning', 'Auth scenario portal loaded', 'Simulating SSO states.');
              }}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                activeView.startsWith('auth') ? 'bg-brand-primary text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              3. Simulated Auth Screens
            </button>
          </div>
        </div>
      </div>

      {/* RENDER ACTIVE SIMULATION SCREENS */}
      {activeView.startsWith('auth') ? (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <AuthScreens 
            onLoginSuccess={(name, role) => {
              setCurrentUser(prev => ({ ...prev, name, role: role as UserRole }));
              handleNavigate('dashboard');
            }}
            onTriggerToast={triggerToast}
          />
        </div>
      ) : (
        /* RENDER INTEGRATED ERP NAVIGATION SHELL & LAYOUT */
        <EnterpriseLayout
          activeRole={currentUser.role}
          onRoleChange={handleRoleChange}
          onNavigate={handleNavigate}
          activeView={activeView}
          onTriggerToast={triggerToast}
          user={currentUser}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<EnterpriseDashboard onTriggerToast={triggerToast} />} />
            <Route path="/docs" element={<DesignSystemDocs onTriggerToast={triggerToast} />} />
            <Route path="/admin" element={<SecurityPolicyConsole onTriggerToast={triggerToast} />} />
            <Route path="/pricing" element={<PricingModule onTriggerToast={triggerToast} />} />
            <Route path="/pricing/*" element={<PricingModule onTriggerToast={triggerToast} />} />
            <Route path="/procurement" element={<ProcurementModule onTriggerToast={triggerToast} />} />
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
                      Verify Component Library
                    </button>
                    <button
                      onClick={() => handleNavigate('dashboard')}
                      className="px-4 py-2 bg-brand-primary hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition shadow-sm cursor-pointer"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              } 
            />
          </Routes>
        </EnterpriseLayout>
      )}

      {/* DYNAMIC ABSOLUTE PORTAL TOASTS NOTIFICATIONSDRAWER */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white rounded-lg border border-brand-border shadow-lg-flat p-4 flex gap-3 animate-slide-in"
          >
            <span className="shrink-0 mt-0.5">
              {toast.type === 'success' ? <CheckCircle2 size={16} className="text-brand-success" /> :
               toast.type === 'error' ? <AlertCircle size={16} className="text-brand-danger" /> :
               toast.type === 'warning' ? <AlertCircle size={16} className="text-brand-warning" /> :
               <Info size={16} className="text-brand-info" />}
            </span>
            <div className="flex-1">
              <h5 className="text-xs font-bold text-brand-text-primary leading-tight">{toast.title}</h5>
              {toast.description && (
                <p className="text-[11px] text-brand-text-secondary mt-1 leading-snug">{toast.description}</p>
              )}
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-brand-text-secondary hover:text-brand-text-primary shrink-0 self-start"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
