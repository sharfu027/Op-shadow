import React from 'react';
import { ShieldAlert, Smartphone } from 'lucide-react';
import { RegisteredDevice, TemporarySecurityException } from '../../../../types/admin';
import { Badge } from '../../../../components/ui/Badge';

interface SecurityDashboardPageProps {
  exceptions: TemporarySecurityException[];
  devices: RegisteredDevice[];
}

export default function SecurityDashboardPage({ exceptions, devices }: SecurityDashboardPageProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="bg-white p-5 rounded-lg border border-brand-border shadow-sm xl:col-span-2 space-y-4">
        <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert size={16} className="text-brand-primary" /> Active Temporary Security Exceptions
        </h4>
        <div className="space-y-3 text-xs">
          {exceptions.map(exc => (
            <div key={exc.id} className="p-3 border rounded bg-brand-bg-secondary/30 space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-brand-primary">{exc.employeeName} ({exc.exceptionType})</span>
                <Badge variant={exc.isExpired ? 'danger' : 'warning'}>{exc.isExpired ? 'Expired' : 'Active Exception'}</Badge>
              </div>
              <p className="text-brand-text-secondary text-[11px]">Reason: "{exc.reason}"</p>
              <p className="text-brand-text-secondary text-[11px]">Approved By: {exc.approvedBy} | Valid: {exc.startDate} to {exc.expiryDate}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg border border-brand-border shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-brand-text-primary uppercase tracking-wider flex items-center gap-1.5">
          <Smartphone size={16} className="text-brand-success" /> Registered Security Devices
        </h4>
        <div className="space-y-2 text-xs">
          {devices.map(dev => (
            <div key={dev.id} className="p-2.5 border rounded bg-brand-bg-secondary/40 space-y-1">
              <div className="flex justify-between font-bold">
                <span>{dev.deviceName}</span>
                <Badge variant="success">Trusted Device</Badge>
              </div>
              <p className="text-brand-text-secondary text-[11px]">User: {dev.registeredToEmployeeName}</p>
              <p className="text-brand-text-secondary text-[11px] font-mono">Last Active: {dev.lastUsedTimestamp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
