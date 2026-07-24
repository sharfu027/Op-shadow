import React from 'react';
import { Supplier } from '../../../../types/supplier';
import { SearchInput } from '../../../../components/ui/SearchInput';
import { Download, Plus, Filter, Star, Award, Eye, Edit2, MoreHorizontal } from 'lucide-react';
import { Badge } from '../../../../components/ui/Badge';
import { useSupplierFilters } from '../../hooks/useSupplierFilters';
import { getStatusVariant } from '../../utils/supplierUtils';
import { NoSuppliersState } from '../empty-states/SupplierEmptyStates';

interface Props {
  suppliers: Supplier[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onCreate: () => void;
  onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
  permissions: { canCreate: boolean; canEdit: boolean; canExport: boolean; canArchive: boolean; };
}

export function SupplierListView({ suppliers, onView, onEdit, onCreate, onTriggerToast, permissions }: Props) {
  const {
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    preferredFilter, setPreferredFilter,
    sortField, sortDir, toggleSort,
    currentPage, setCurrentPage,
    paginated, totalPages, filtered
  } = useSupplierFilters(suppliers);

  return (
    <div className="bg-white rounded-lg border border-brand-border shadow-sm-flat overflow-hidden flex flex-col">
      <div className="p-4 border-b space-y-3">
        <div className="flex justify-between items-center">
          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search supplier code, name, GST..." className="max-w-md" />
          <div className="flex gap-2">
            {permissions.canExport && (
              <button onClick={() => onTriggerToast('info', 'Exporting Data', 'Exporting current view to Excel...')} className="px-3 py-1.5 border border-brand-border text-brand-text-primary text-xs font-semibold rounded flex items-center gap-1 hover:bg-brand-bg-secondary cursor-pointer">
                <Download size={14} /> Export
              </button>
            )}
            {permissions.canCreate && (
              <button onClick={onCreate} className="px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded flex items-center gap-1 hover:bg-blue-700 cursor-pointer">
                <Plus size={14} /> Add Supplier
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs items-center bg-brand-bg-secondary/30 p-2 rounded">
          <Filter size={14} className="text-brand-text-secondary" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white border rounded px-2 py-1 outline-none">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending approval">Pending</option>
            <option value="blocked">Blocked</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-white border rounded px-2 py-1 outline-none">
            <option value="all">All Types</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="distributor">Distributor</option>
            <option value="service provider">Service Provider</option>
          </select>
          {/* Mock Risk Filter */}
          <select className="bg-white border rounded px-2 py-1 outline-none">
            <option value="all">All Risks</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
          <label className="flex items-center gap-1.5 cursor-pointer text-brand-text-primary">
            <input type="checkbox" checked={preferredFilter} onChange={e => setPreferredFilter(e.target.checked)} className="rounded border-brand-border text-brand-primary focus:ring-brand-primary" />
            Preferred Only
          </label>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        {filtered.length === 0 ? (
          <NoSuppliersState onAction={onCreate} />
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-brand-bg-secondary border-b text-[10px] font-bold text-brand-text-secondary uppercase">
              <tr>
                <th className="p-3 w-8"><input type="checkbox" className="rounded" /></th>
                <th className="p-3 cursor-pointer hover:text-brand-primary" onClick={() => toggleSort('supplier_code')}>Supplier Code {sortField === 'supplier_code' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="p-3 cursor-pointer hover:text-brand-primary" onClick={() => toggleSort('legal_name')}>Supplier Info {sortField === 'legal_name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">GSTIN</th>
                <th className="p-3 text-center">Rating</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {paginated.map(s => (
                <tr key={s.id} className="hover:bg-brand-bg-secondary/30">
                  <td className="p-3"><input type="checkbox" className="rounded" /></td>
                  <td className="p-3 font-mono font-bold text-brand-primary">{s.supplier_code}</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-brand-text-primary">{s.legal_name}</span>
                        {s.is_preferred && <Star size={12} className="text-amber-500 fill-amber-500" title="Preferred Supplier" />}
                        {s.is_strategic && <Award size={12} className="text-purple-500" title="Strategic Partner" />}
                      </div>
                      <span className="text-[10px] text-brand-text-secondary">{s.country_name} | {s.primary_site_name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <span>{s.supplier_category_name}</span>
                      <span className="text-[10px] text-brand-text-secondary">{s.supplier_type_name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={getStatusVariant(s.supplier_status_name)}>{s.supplier_status_name}</Badge>
                  </td>
                  <td className="p-3 font-mono text-brand-text-secondary">{s.gst_number || '-'}</td>
                  <td className="p-3 text-center font-bold text-amber-600">{s.overall_rating} ★</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => onView(s.id)} className="p-1.5 border rounded text-brand-text-primary hover:bg-brand-bg-secondary cursor-pointer" title="View Details">
                        <Eye size={14} />
                      </button>
                      {permissions.canEdit && (
                        <button onClick={() => onEdit(s.id)} className="p-1.5 border rounded text-brand-text-primary hover:bg-brand-bg-secondary cursor-pointer" title="Edit">
                          <Edit2 size={14} />
                        </button>
                      )}
                      <button className="p-1.5 border rounded text-brand-text-primary hover:bg-brand-bg-secondary cursor-pointer" title="More Actions">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="p-3 border-t bg-brand-bg-secondary/10 flex justify-between items-center text-xs text-brand-text-secondary">
        <span>Showing {(currentPage - 1) * paginated.length + 1}–{Math.min(currentPage * paginated.length, filtered.length)} of {filtered.length} suppliers</span>
        <div className="flex items-center gap-2">
          <span>Page {currentPage} of {Math.max(totalPages, 1)}</span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 border rounded hover:bg-brand-bg-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-2 py-1 border rounded hover:bg-brand-bg-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
