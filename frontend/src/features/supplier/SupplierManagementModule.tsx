import React from 'react';
import { MOCK_SUPPLIERS, MOCK_PERFORMANCE } from './data/mockSuppliers';
import { useSupplierNavigation } from './hooks/useSupplierNavigation';
import { useSupplierPermissions } from './hooks/useSupplierPermissions';
import { SupplierDashboardView } from './components/dashboard/SupplierDashboardView';
import { SupplierListView } from './components/list/SupplierListView';
import { SupplierDetailView } from './components/detail/SupplierDetailView';
import { SupplierWizardView } from './components/wizard/SupplierWizardView';
import { Activity, Layers } from 'lucide-react';

interface SupplierManagementModuleProps {
  onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export default function SupplierManagementModule({ onTriggerToast }: SupplierManagementModuleProps) {
  const nav = useSupplierNavigation();
  const permissions = useSupplierPermissions('Procurement Manager');
  const selectedSupplier = MOCK_SUPPLIERS.find(s => s.id === nav.selectedSupplierId);

  return (
    <div className="space-y-4">
      {/* Top Nav Tabs */}
      <div className="flex gap-2">
        <button
          onClick={nav.navigateToDashboard}
          className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
            nav.currentView === 'dashboard' ? 'bg-brand-primary text-white shadow-xs' : 'bg-white border text-brand-text-secondary hover:text-brand-text-primary'
          }`}
          aria-current={nav.currentView === 'dashboard' ? 'page' : undefined}
        >
          <Activity size={14} /> Dashboard
        </button>
        <button
          onClick={nav.navigateToList}
          className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
            ['list', 'detail'].includes(nav.currentView) ? 'bg-brand-primary text-white shadow-xs' : 'bg-white border text-brand-text-secondary hover:text-brand-text-primary'
          }`}
          aria-current={['list', 'detail'].includes(nav.currentView) ? 'page' : undefined}
        >
          <Layers size={14} /> Supplier Master
        </button>
      </div>

      {/* View Rendering */}
      {nav.currentView === 'dashboard' && (
        <SupplierDashboardView
          onNavigate={nav.setCurrentView as any}
          onNavigateToCreate={nav.navigateToCreate}
          onTriggerToast={onTriggerToast}
        />
      )}

      {nav.currentView === 'list' && (
        <SupplierListView
          suppliers={MOCK_SUPPLIERS}
          onView={nav.navigateToDetail}
          onEdit={nav.navigateToEdit}
          onCreate={nav.navigateToCreate}
          onTriggerToast={onTriggerToast}
          permissions={permissions}
        />
      )}

      {nav.currentView === 'detail' && selectedSupplier && (
        <SupplierDetailView
          supplier={selectedSupplier}
          performance={MOCK_PERFORMANCE}
          onBack={nav.navigateToList}
          onEdit={() => nav.navigateToEdit(selectedSupplier.id)}
          onNavigate={(view) => nav.setCurrentView(view as any)}
          detailTab={nav.detailTab}
          onTabChange={nav.setDetailTab}
          onTriggerToast={onTriggerToast}
          permissions={permissions}
          getBreadcrumbs={() => nav.getBreadcrumbs(selectedSupplier.legal_name)}
        />
      )}

      {(nav.currentView === 'create' || nav.currentView === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl max-h-[90vh]">
            <SupplierWizardView
              onClose={nav.navigateToList}
              supplierId={nav.currentView === 'edit' ? nav.selectedSupplierId ?? undefined : undefined}
              onTriggerToast={onTriggerToast}
              wizardStep={nav.wizardStep}
              onStepChange={nav.setWizardStep}
            />
          </div>
        </div>
      )}
    </div>
  );
}
