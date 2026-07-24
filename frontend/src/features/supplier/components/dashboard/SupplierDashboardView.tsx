import React from 'react';
import { Plus, ShieldCheck, Download, BarChart3, AlertTriangle, Clock } from 'lucide-react';
import { StatCard } from '../../../../components/ui/StatCard';
import { MOCK_METRICS } from '../../data/mockSuppliers';

interface Props {
  onNavigate: (view: string) => void;
  onNavigateToCreate: () => void;
  onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
  userRole?: string;
}

const QUICK_ACTIONS = [
  { id: 'create', label: 'Create Supplier', icon: Plus, variant: 'primary', action: 'create' },
  { id: 'compliance', label: 'Run Compliance Check', icon: ShieldCheck, variant: 'secondary', action: 'compliance' },
  { id: 'export', label: 'Export Supplier Data', icon: Download, variant: 'secondary', action: 'export' },
  { id: 'reports', label: 'Performance Reports', icon: BarChart3, variant: 'secondary', action: 'reports' },
];

export function SupplierDashboardView({ onNavigate, onNavigateToCreate, onTriggerToast, userRole }: Props) {
  const handleAction = (action: string) => {
    switch (action) {
      case 'create':
        onNavigateToCreate();
        break;
      case 'compliance':
        onTriggerToast('info', 'Compliance Check', 'Initiating background compliance check for all active suppliers');
        break;
      case 'export':
        onTriggerToast('info', 'Exporting Data', 'Downloading supplier master list...');
        break;
      case 'reports':
        onTriggerToast('info', 'Generating Reports', 'Navigating to Performance Reports module');
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard title="Total Suppliers" value={MOCK_METRICS.total_suppliers} badgeText="Directory" badgeVariant="neutral" />
        <StatCard title="Active Suppliers" value={MOCK_METRICS.active_suppliers} badgeText="Ready" badgeVariant="success" />
        <StatCard title="Pending Approval" value={MOCK_METRICS.pending_approval} badgeText="Requires Review" badgeVariant="warning" />
        <StatCard title="Preferred" value={MOCK_METRICS.preferred_suppliers} badgeText="Preferred" badgeVariant="primary" />
        <StatCard title="Strategic" value={MOCK_METRICS.strategic_suppliers} badgeText="Partners" badgeVariant="success" />
        <StatCard title="Blocked / Blacklisted" value={MOCK_METRICS.blocked_suppliers + MOCK_METRICS.blacklisted_suppliers} badgeText="Restricted" badgeVariant="danger" />
        <StatCard title="Avg Rating" value={`${MOCK_METRICS.avg_overall_rating} ★`} badgeText="Performance" badgeVariant="primary" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-lg border border-brand-border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">Top Performing Suppliers</h4>
              <button onClick={() => onNavigate('list')} className="text-brand-primary text-xs font-semibold hover:underline cursor-pointer">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-brand-bg-secondary border-b text-[10px] font-bold text-brand-text-secondary uppercase">
                  <tr>
                    <th className="p-3">Supplier Name</th>
                    <th className="p-3 text-center">Rating</th>
                    <th className="p-3 text-right">Orders Delivered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {MOCK_METRICS.top_suppliers.map(ts => (
                    <tr key={ts.id} className="hover:bg-brand-bg-secondary/30">
                      <td className="p-3 font-semibold">{ts.name}</td>
                      <td className="p-3 text-center font-bold text-amber-600">{ts.rating} ★</td>
                      <td className="p-3 text-right font-mono">{ts.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg border border-brand-border shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider">Quick Actions</h4>
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <button 
                  key={action.id} 
                  onClick={() => handleAction(action.action)}
                  className={`w-full py-2 text-xs font-semibold rounded transition cursor-pointer flex items-center justify-center gap-2 ${action.variant === 'primary' ? 'bg-brand-primary text-white hover:bg-blue-700' : 'border border-brand-border text-brand-text-primary hover:bg-brand-bg-secondary'}`}
                >
                  <Icon size={16} /> {action.label}
                </button>
              );
            })}
          </div>

          <div className="bg-white p-5 rounded-lg border border-brand-border shadow-sm">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-4">Alerts & Notifications</h4>
            <div className="space-y-3">
              <div className="flex gap-2 items-start text-xs bg-amber-50 p-2.5 rounded border border-amber-100">
                <AlertTriangle size={16} className="text-brand-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-brand-text-primary">{MOCK_METRICS.compliance_alerts} Compliance Alerts</p>
                  <p className="text-brand-text-secondary text-[11px] mt-0.5">Suppliers require KYC renewal</p>
                </div>
              </div>
              <div className="flex gap-2 items-start text-xs bg-red-50 p-2.5 rounded border border-red-100">
                <Clock size={16} className="text-brand-danger shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-brand-text-primary">{MOCK_METRICS.expiring_documents} Expiring Documents</p>
                  <p className="text-brand-text-secondary text-[11px] mt-0.5">GST certificates expiring in 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
