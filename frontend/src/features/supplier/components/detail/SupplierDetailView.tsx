import React from 'react';
import { Supplier, SupplierDetailTab, SupplierPerformance } from '../../../../types/supplier';
import { ChevronLeft, Edit2, AlertTriangle, Star } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { SupplierBreadcrumb } from '../shared/SupplierBreadcrumb';
import { SupplierStatusBadge } from '../shared/SupplierStatusBadge';
import { DETAIL_TABS } from '../../constants/supplierConstants';
import { useSupplierPermissions } from '../../hooks/useSupplierPermissions';
import { OverviewTab } from './tabs/OverviewTab';
import { SitesTab } from './tabs/SitesTab';
import { ComplianceTab } from './tabs/ComplianceTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { ActivityTimelineTab } from './tabs/ActivityTimelineTab';
import { NoContactsState, NoAddressesState, NoBankAccountsState, NoCertificationsState, NoComplianceState, NoPerformanceReviewsState } from '../empty-states/SupplierEmptyStates';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Layers } from 'lucide-react';

interface Props {
  supplier: Supplier;
  onBack: () => void;
  onEdit: () => void;
  onNavigate: (view: string) => void;
  detailTab: SupplierDetailTab;
  onTabChange: (tab: SupplierDetailTab) => void;
  onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
  permissions: ReturnType<typeof useSupplierPermissions>;
  getBreadcrumbs: () => { label: string, view: string | null }[];
  performance?: SupplierPerformance;
}

export function SupplierDetailView({ supplier, performance, onBack, onEdit, onNavigate, detailTab, onTabChange, onTriggerToast, permissions, getBreadcrumbs }: Props) {
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="space-y-4">
      <SupplierBreadcrumb items={breadcrumbs} onNavigate={onNavigate} />
      
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-brand-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 border rounded hover:bg-brand-bg-secondary cursor-pointer text-brand-text-secondary">
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-brand-text-primary">{supplier.legal_name}</h2>
              <SupplierStatusBadge status={supplier.supplier_status_name} />
              {supplier.is_preferred && <Badge variant="primary"><Star size={10} className="mr-1 inline" /> Preferred</Badge>}
            </div>
            <p className="text-xs text-brand-text-secondary font-mono">{supplier.supplier_code} | {supplier.supplier_category_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {permissions.canEdit && (
            <button onClick={onEdit} className="px-3 py-1.5 border border-brand-border text-brand-text-primary text-xs font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer flex items-center gap-1">
              <Edit2 size={14} /> Edit
            </button>
          )}
          {permissions.canBlock && (
            <button className="px-3 py-1.5 border border-red-200 text-brand-danger text-xs font-semibold rounded hover:bg-red-50 cursor-pointer flex items-center gap-1">
              <AlertTriangle size={14} /> Block
            </button>
          )}
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="flex gap-1 overflow-x-auto border-b border-brand-border pb-px no-scrollbar">
        {DETAIL_TABS.map(t => {
          const isActive = detailTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors border-b-2 ${
                isActive ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white p-5 rounded-lg border border-brand-border shadow-sm min-h-[400px]">
        {detailTab === 'overview' && <OverviewTab supplier={supplier} performance={performance} onEdit={onEdit} onTriggerToast={onTriggerToast} />}
        {detailTab === 'sites' && <SitesTab supplier={supplier} />}
        {detailTab === 'contacts' && <NoContactsState />}
        {detailTab === 'addresses' && <NoAddressesState />}
        {detailTab === 'bank-accounts' && <NoBankAccountsState />}
        {detailTab === 'documents' && <DocumentsTab supplier={supplier} />}
        {detailTab === 'compliance' && <ComplianceTab supplier={supplier} />}
        {detailTab === 'performance' && <PerformanceTab performance={performance} />}
        {detailTab === 'audit' && <ActivityTimelineTab />}
        
        {/* Other tabs that are not implemented yet */}
        {['tax-profiles', 'certifications', 'product-categories', 'relationships', 'status-history'].includes(detailTab) && (
           <EmptyState icon={Layers} title={`${DETAIL_TABS.find(t=>t.id===detailTab)?.label} Data Ready`} description={`The ${detailTab} module structure is prepared for API integration.`} />
        )}
      </div>
    </div>
  );
}
