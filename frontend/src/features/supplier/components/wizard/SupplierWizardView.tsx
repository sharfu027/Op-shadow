import React, { useState } from 'react';
import { SupplierWizardStep } from '../../../../types/supplier';
import { WIZARD_STEPS } from '../../constants/supplierConstants';
import { X, Check, ChevronLeft, ChevronRight, Layers, AlertTriangle } from 'lucide-react';

interface Props {
  onClose: () => void;
  supplierId?: string; // if editing
  onTriggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
  wizardStep: SupplierWizardStep;
  onStepChange: (step: SupplierWizardStep) => void;
}

export function SupplierWizardView({ onClose, supplierId, onTriggerToast, wizardStep, onStepChange }: Props) {
  const [isDirty, setIsDirty] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const stepIndex = WIZARD_STEPS.findIndex(s => s.id === wizardStep);

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-brand-border shadow-xl flex flex-col w-full h-[80vh] min-h-[600px] relative" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
      
      {showExitConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-lg backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-brand-border shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-brand-warning shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-brand-text-primary">Unsaved Changes</h4>
                <p className="text-xs text-brand-text-secondary mt-1">You have unsaved changes. What would you like to do?</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => setShowExitConfirm(false)} className="w-full px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded hover:bg-blue-700 cursor-pointer">Stay Editing</button>
              <button onClick={() => { onTriggerToast('success', 'Draft Saved', 'Your changes have been saved as a draft.'); onClose(); }} className="w-full px-4 py-2 border text-xs font-semibold rounded hover:bg-brand-bg-secondary cursor-pointer">Save Draft</button>
              <button onClick={onClose} className="w-full px-4 py-2 text-brand-danger text-xs font-semibold cursor-pointer hover:underline">Discard Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Header / Progress */}
      <div className="p-4 border-b bg-brand-bg-secondary/10 flex justify-between items-center">
        <h3 id="wizard-title" className="text-base font-bold text-brand-text-primary">
          {supplierId ? 'Edit Supplier' : 'Supplier Onboarding'}
        </h3>
        <button onClick={handleCloseAttempt} className="text-brand-text-secondary hover:text-brand-text-primary cursor-pointer" aria-label="Close dialog">
          <X size={18} />
        </button>
      </div>

      <div className="px-6 py-4 border-b flex justify-between items-center relative overflow-x-auto no-scrollbar">
        <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
        {WIZARD_STEPS.map((step, idx) => {
          const isCompleted = idx < stepIndex;
          const isCurrent = idx === stepIndex;
          return (
            <div key={step.id} className="flex flex-col items-center gap-1 bg-white px-2 cursor-pointer shrink-0" onClick={() => onStepChange(step.id)}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                isCompleted ? 'bg-brand-primary border-brand-primary text-white' :
                isCurrent ? 'bg-white border-brand-primary text-brand-primary' :
                'bg-white border-gray-300 text-gray-400'
              }`}>
                {isCompleted ? <Check size={12} /> : (idx + 1)}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-brand-primary' : 'text-brand-text-secondary'}`}>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Wizard Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {wizardStep === 'general' && (
          <div className="space-y-6 animate-fade-in max-w-2xl">
            <div>
              <h4 className="text-sm font-bold text-brand-text-primary border-b pb-2 mb-4">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="legalName" className="text-[10px] font-bold text-brand-text-secondary uppercase">Legal Entity Name <span className="text-brand-danger">*</span></label>
                  <input id="legalName" type="text" onChange={() => setIsDirty(true)} className="w-full text-xs border rounded px-3 py-2 outline-none focus:border-brand-primary" placeholder="e.g. Hindustan Unilever Limited" aria-label="Legal Entity Name" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="displayName" className="text-[10px] font-bold text-brand-text-secondary uppercase">Display Name <span className="text-brand-danger">*</span></label>
                  <input id="displayName" type="text" onChange={() => setIsDirty(true)} className="w-full text-xs border rounded px-3 py-2 outline-none focus:border-brand-primary" placeholder="e.g. HUL" aria-label="Display Name" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="supplierType" className="text-[10px] font-bold text-brand-text-secondary uppercase">Supplier Type</label>
                  <select id="supplierType" onChange={() => setIsDirty(true)} className="w-full text-xs border rounded px-3 py-2 outline-none focus:border-brand-primary" aria-label="Supplier Type">
                    <option>Manufacturer</option>
                    <option>Distributor</option>
                    <option>Service Provider</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="category" className="text-[10px] font-bold text-brand-text-secondary uppercase">Category</label>
                  <select id="category" onChange={() => setIsDirty(true)} className="w-full text-xs border rounded px-3 py-2 outline-none focus:border-brand-primary" aria-label="Category">
                    <option>FMCG Consumables</option>
                    <option>Packaging Material</option>
                    <option>Raw Materials</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-brand-text-primary border-b pb-2 mb-4">Registration & Tax</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="gstin" className="text-[10px] font-bold text-brand-text-secondary uppercase">GSTIN</label>
                  <input id="gstin" type="text" onChange={() => setIsDirty(true)} className="w-full text-xs border rounded px-3 py-2 outline-none focus:border-brand-primary font-mono uppercase" placeholder="15 Digit GSTIN" aria-label="GSTIN" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="pan" className="text-[10px] font-bold text-brand-text-secondary uppercase">PAN Number</label>
                  <input id="pan" type="text" onChange={() => setIsDirty(true)} className="w-full text-xs border rounded px-3 py-2 outline-none focus:border-brand-primary font-mono uppercase" placeholder="10 Digit PAN" aria-label="PAN Number" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {wizardStep !== 'general' && (
          <div className="flex flex-col items-center justify-center h-full text-brand-text-secondary space-y-2 animate-fade-in">
            <Layers size={32} className="text-gray-300" />
            <p className="text-sm font-medium">Step: {WIZARD_STEPS.find(s => s.id === wizardStep)?.label}</p>
            <p className="text-xs">Step ready for API integration</p>
          </div>
        )}
      </div>

      {/* Wizard Footer */}
      <div className="p-4 border-t bg-brand-bg-secondary/10 flex justify-between items-center">
        <button 
          onClick={() => { if (stepIndex > 0) onStepChange(WIZARD_STEPS[stepIndex - 1].id); }}
          disabled={stepIndex === 0}
          className={`px-4 py-2 border rounded text-xs font-semibold flex items-center gap-1 ${stepIndex === 0 ? 'text-gray-400 border-gray-200' : 'text-brand-text-primary hover:bg-brand-bg-secondary cursor-pointer'}`}
        >
          <ChevronLeft size={14} /> Previous
        </button>
        
        <div className="flex gap-2">
          <button onClick={() => { onTriggerToast('success', 'Draft Saved', 'Your changes have been saved as a draft.'); onClose(); }} className="px-4 py-2 border text-brand-text-primary rounded text-xs font-semibold hover:bg-brand-bg-secondary cursor-pointer">
            Save Draft
          </button>
          <button 
            onClick={() => {
              if (stepIndex < WIZARD_STEPS.length - 1) {
                onStepChange(WIZARD_STEPS[stepIndex + 1].id);
              } else {
                onTriggerToast('success', 'Supplier Created', 'New supplier has been successfully onboarded and sent for approval.');
                onClose();
              }
            }}
            className="px-4 py-2 bg-brand-primary text-white rounded text-xs font-semibold hover:bg-blue-700 cursor-pointer flex items-center gap-1 shadow-sm"
          >
            {stepIndex === WIZARD_STEPS.length - 1 ? <><Check size={14} /> Submit for Approval</> : <>Next <ChevronRight size={14} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
