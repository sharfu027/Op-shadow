import React from 'react';
import { Supplier, SupplierPerformance } from '../../../../../types/supplier';
import { CheckCircle2, XCircle, AlertTriangle, MapPin, Users, Banknote, ShieldCheck, Activity, Star, Info, FileText, Download, Edit2, Upload, Ban } from 'lucide-react';
import { SupplierStatusBadge } from '../../shared/SupplierStatusBadge';
import { SupplierRatingStars } from '../../shared/SupplierRatingStars';
import { SupplierPerformanceBar } from '../../shared/SupplierPerformanceBar';
import { getRiskColor, getRiskLabel } from '../../../utils/supplierUtils';
import { Badge } from '../../../../../components/ui/Badge';

interface Props {
  supplier: Supplier;
  performance?: SupplierPerformance;
  onEdit: () => void;
  onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export function OverviewTab({ supplier, performance, onEdit, onTriggerToast }: Props) {
  return (
    <div className="space-y-4">
      {/* Quick Actions Bar */}
      <div className="bg-brand-bg-secondary/20 p-3 rounded-lg border border-brand-border flex flex-wrap gap-2 mb-6">
        <button onClick={onEdit} className="px-3 py-1.5 bg-white border border-brand-border text-brand-text-primary text-xs font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer flex items-center gap-1.5">
          <Edit2 size={14} /> Edit Details
        </button>
        <button onClick={() => onTriggerToast('info', 'Add Site', 'Opening site addition modal')} className="px-3 py-1.5 bg-white border border-brand-border text-brand-text-primary text-xs font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer flex items-center gap-1.5">
          <MapPin size={14} /> Add Site
        </button>
        <button onClick={() => onTriggerToast('info', 'Upload Doc', 'Opening document uploader')} className="px-3 py-1.5 bg-white border border-brand-border text-brand-text-primary text-xs font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer flex items-center gap-1.5">
          <Upload size={14} /> Upload Doc
        </button>
        <div className="flex-1"></div>
        <button onClick={() => onTriggerToast('warning', 'Block Supplier', 'Initiating block protocol')} className="px-3 py-1.5 bg-white border border-red-200 text-brand-danger text-xs font-semibold rounded hover:bg-red-50 cursor-pointer flex items-center gap-1.5">
          <Ban size={14} /> Block
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <div className="border border-brand-border rounded-lg p-4 bg-white shadow-sm">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
              <Info size={16} className="text-brand-primary" /> General Information
            </h4>
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div><span className="text-brand-text-secondary block mb-1">Supplier Code</span><span className="font-mono font-bold text-sm">{supplier.supplier_code}</span></div>
              <div><span className="text-brand-text-secondary block mb-1">Display Name</span><span className="font-bold text-sm">{supplier.display_name}</span></div>
              <div><span className="text-brand-text-secondary block mb-1">Type</span><span className="font-semibold">{supplier.supplier_type_name}</span></div>
              <div><span className="text-brand-text-secondary block mb-1">Category</span><span className="font-semibold">{supplier.supplier_category_name}</span></div>
              <div><span className="text-brand-text-secondary block mb-1">Country</span><span>{supplier.country_name}</span></div>
              <div><span className="text-brand-text-secondary block mb-1">Currency</span><span>{supplier.default_currency_code}</span></div>
              <div><span className="text-brand-text-secondary block mb-1">GSTIN</span><span className="font-mono">{supplier.gst_number || '-'}</span></div>
              <div><span className="text-brand-text-secondary block mb-1">PAN</span><span className="font-mono">{supplier.pan_number || '-'}</span></div>
            </div>
          </div>

          <div className="border border-brand-border rounded-lg p-4 bg-white shadow-sm">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
              <Users size={16} className="text-brand-primary" /> Primary Contact
            </h4>
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div><span className="text-brand-text-secondary block mb-1">Contact Person</span><span className="font-semibold">{supplier.primary_contact_name}</span></div>
              <div><span className="text-brand-text-secondary block mb-1">Phone</span><span>{supplier.primary_phone}</span></div>
              <div className="col-span-2"><span className="text-brand-text-secondary block mb-1">Email</span><span>{supplier.primary_email}</span></div>
            </div>
          </div>
          
          <div className="border border-brand-border rounded-lg p-4 bg-white shadow-sm">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
              <MapPin size={16} className="text-brand-primary" /> Primary Site
            </h4>
            <div className="text-xs">
              <span className="font-bold text-brand-primary block mb-1">{supplier.primary_site_name}</span>
              <p className="text-brand-text-secondary">Default Procurement Site</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="border border-brand-border rounded-lg p-4 bg-white shadow-sm">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
              <ShieldCheck size={16} className="text-brand-primary" /> Compliance Snapshot
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2 rounded hover:bg-brand-bg-secondary/30 border border-transparent hover:border-brand-border">
                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-success" /> KYC Status</span>
                <span className="font-semibold text-brand-success">Verified</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-brand-bg-secondary/30 border border-transparent hover:border-brand-border">
                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-success" /> Sanctions Check</span>
                <span className="font-semibold text-brand-success">Clear</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-brand-bg-secondary/30 border border-transparent hover:border-brand-border">
                <span className="flex items-center gap-2">
                  {supplier.gst_number ? <CheckCircle2 size={16} className="text-brand-success" /> : <XCircle size={16} className="text-brand-danger" />} 
                  GSTIN Verification
                </span>
                <span className={`font-semibold ${supplier.gst_number ? 'text-brand-success' : 'text-brand-danger'}`}>
                  {supplier.gst_number ? 'Verified' : 'Missing'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-brand-bg-secondary/30 border border-transparent hover:border-brand-border">
                <span className="flex items-center gap-2">
                  {supplier.pan_number ? <CheckCircle2 size={16} className="text-brand-success" /> : <XCircle size={16} className="text-brand-danger" />} 
                  PAN Verification
                </span>
                <span className={`font-semibold ${supplier.pan_number ? 'text-brand-success' : 'text-brand-danger'}`}>
                  {supplier.pan_number ? 'Verified' : 'Missing'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-brand-bg-secondary/30 border border-transparent hover:border-brand-border">
                <span className="flex items-center gap-2"><AlertTriangle size={16} className="text-brand-warning" /> ESG Assessment</span>
                <span className="font-semibold text-brand-warning">Pending</span>
              </div>
            </div>
          </div>

          <div className="border border-brand-border rounded-lg p-4 bg-white shadow-sm">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
              <Activity size={16} className="text-brand-primary" /> Risk Summary
            </h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center shrink-0" style={{ borderColor: supplier.risk_level === 1 ? '#10B981' : supplier.risk_level === 2 ? '#F59E0B' : '#EF4444' }}>
                <span className={`font-bold text-lg ${getRiskColor(supplier.risk_level || 1)}`}>{supplier.risk_level}</span>
              </div>
              <div>
                <div className={`font-bold ${getRiskColor(supplier.risk_level || 1)}`}>{getRiskLabel(supplier.risk_level || 1)} Risk Level</div>
                <p className="text-xs text-brand-text-secondary mt-1">Based on compliance, performance, and financial data.</p>
              </div>
            </div>
          </div>

          {performance && (
            <div className="border border-brand-border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Star size={16} className="text-brand-primary" /> Performance Summary
                </h4>
                <div className="flex items-center gap-1 font-bold text-brand-primary text-sm">
                  {performance.overall_rating} <SupplierRatingStars rating={performance.overall_rating} showNumber={false} maxRating={1} />
                </div>
              </div>
              <div className="space-y-4">
                <SupplierPerformanceBar label="On-Time Delivery" value={performance.on_time_delivery_pct} />
                <SupplierPerformanceBar label="Quality / Fill Rate" value={performance.fill_rate_pct} />
                <SupplierPerformanceBar label="Defect Rate" value={performance.defect_rate_pct} invert={true} />
              </div>
            </div>
          )}

          <div className="border border-brand-border rounded-lg p-4 bg-white shadow-sm">
            <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2">
              <FileText size={16} className="text-brand-primary" /> Documents Expiring Soon
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2 bg-red-50 border border-red-100 rounded">
                <div>
                  <span className="font-semibold text-brand-text-primary block">MSME Certificate</span>
                  <span className="text-[10px] text-brand-text-secondary">Expiring: 2025-06-01</span>
                </div>
                <Badge variant="danger">Action Required</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
